package ir.robocar.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Vibrator;
import android.provider.Settings;
import android.view.Surface;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

/**
 * RoboCar app 2.0.0
 *  - The whole control UI lives in assets/index.html (the same file the car serves itself at http://192.168.4.1).
 *  - Binds the process to the Wi-Fi network, so the car's Wi-Fi is used even when mobile data is on.
 *  - Full screen; the page tells the car to stop when the app goes to the background (and reconnects on return).
 *  - Tilt steering (accelerometer) -> window.__tilt(degrees);  RCApp bridge: vibrate, openWifi, openUrl, share, keepAwake.
 */
public class MainActivity extends Activity implements SensorEventListener {
    private static final String UI_URL = "file:///android_asset/index.html";

    private WebView web;
    private ConnectivityManager cm;
    private ConnectivityManager.NetworkCallback callback;
    private final Handler ui = new Handler(Looper.getMainLooper());

    private SensorManager sm;
    private boolean tiltOn = false;
    private float tiltSmooth = 0f;
    private boolean tiltFirst = true;
    private long lastTiltSend = 0;
    private boolean loaded = false;
    private boolean frozen = false;
    // The page needs a moment to stop the car and close its socket before it is frozen.
    private final Runnable freezer = new Runnable() {
        @Override public void run() {
            try { web.onPause(); web.pauseTimers(); frozen = true; } catch (Exception ignored) {}
        }
    };

    /** Methods the page can call as RCApp.xxx() */
    private final class Bridge {
        @JavascriptInterface public void tiltStart() {
            ui.post(new Runnable() { @Override public void run() { enableTilt(true); } });
        }
        @JavascriptInterface public void tiltStop() {
            ui.post(new Runnable() { @Override public void run() { enableTilt(false); } });
        }
        @JavascriptInterface public void openWifi() {
            ui.post(new Runnable() {
                @Override public void run() {
                    try { startActivity(new Intent(Settings.ACTION_WIFI_SETTINGS)); } catch (Exception ignored) {}
                }
            });
        }
        @JavascriptInterface public void openUrl(final String url) {
            // only the car itself (private network addresses) may be opened
            if (url == null) return;
            final boolean ok = url.startsWith("http://192.168.") || url.startsWith("http://10.") || url.startsWith("http://172.");
            if (!ok) return;
            ui.post(new Runnable() {
                @Override public void run() {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception ignored) {}
                }
            });
        }
        @JavascriptInterface public void share(final String text) {
            if (text == null) return;
            final String t = text.length() > 20000 ? text.substring(0, 20000) : text;
            ui.post(new Runnable() {
                @Override public void run() {
                    try {
                        Intent i = new Intent(Intent.ACTION_SEND);
                        i.setType("text/plain");
                        i.putExtra(Intent.EXTRA_TEXT, t);
                        startActivity(Intent.createChooser(i, "RoboCar"));
                    } catch (Exception ignored) {}
                }
            });
        }
        @JavascriptInterface public void keepAwake(final boolean on) {
            ui.post(new Runnable() {
                @Override public void run() {
                    if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                }
            });
        }
        @SuppressWarnings("deprecation")
        @JavascriptInterface public void vibrate(int ms) {
            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null) v.vibrate(Math.max(1, Math.min(ms, 120)));
            } catch (Exception ignored) {}
        }
    }

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
        web = new WebView(this);
        web.setBackgroundColor(0xFF080C12);
        web.setLongClickable(false);
        web.setHapticFeedbackEnabled(false);
        web.setOnLongClickListener(new View.OnLongClickListener() {
            @Override public boolean onLongClick(View v) { return true; }
        });
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setMediaPlaybackRequiresUserGesture(true);
        web.addJavascriptInterface(new Bridge(), "RCApp");
        web.setWebViewClient(new WebViewClient());
        setContentView(web);
        cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        sm = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        immersive();
        web.loadUrl(UI_URL);
        loaded = true;
    }

    private void immersive() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) immersive();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Bind to the Wi-Fi network so traffic to the car goes there even if Android prefers mobile data.
        try {
            NetworkRequest req = new NetworkRequest.Builder()
                .addTransportType(NetworkCapabilities.TRANSPORT_WIFI).build();
            callback = new ConnectivityManager.NetworkCallback() {
                @Override public void onAvailable(final Network n) {
                    try { cm.bindProcessToNetwork(n); } catch (Exception ignored) {}
                }
                @Override public void onLost(final Network n) {
                    try { cm.bindProcessToNetwork(null); } catch (Exception ignored) {}
                }
            };
            cm.requestNetwork(req, callback);
        } catch (Exception ignored) {}
        ui.removeCallbacks(freezer);
        if (frozen) {
            web.onResume();
            web.resumeTimers();
            frozen = false;
        }
        if (loaded) web.evaluateJavascript("window.__resume&&window.__resume()", null);
    }

    @Override
    protected void onPause() {
        super.onPause();
        enableTilt(false);
        // the page stops the car and closes its connection, then the page is frozen
        web.evaluateJavascript("window.__pause&&window.__pause()", null);
        ui.postDelayed(freezer, 600);
        try { if (callback != null) cm.unregisterNetworkCallback(callback); } catch (Exception ignored) {}
        callback = null;
        try { cm.bindProcessToNetwork(null); } catch (Exception ignored) {}
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        ui.removeCallbacks(freezer);
        try { web.destroy(); } catch (Exception ignored) {}
    }

    @Override
    public void onBackPressed() {
        // Let the page close its dialog / page first; leave the app only when it says there is nothing to close.
        web.evaluateJavascript("window.__back?String(window.__back()):'false'", new ValueCallback<String>() {
            @Override public void onReceiveValue(String v) {
                if (v == null || !v.contains("true")) finish();
            }
        });
    }

    // ---------------- tilt steering ----------------
    private void enableTilt(boolean on) {
        if (on == tiltOn) return;
        tiltOn = on;
        if (on) {
            Sensor a = sm.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            if (a != null) { tiltFirst = true; sm.registerListener(this, a, SensorManager.SENSOR_DELAY_GAME); }
            else tiltOn = false;
        } else {
            sm.unregisterListener(this);
        }
    }

    @Override
    public void onSensorChanged(SensorEvent e) {
        if (!tiltOn) return;
        float ax = e.values[0], ay = e.values[1];
        double th;
        // Angle of the "steering wheel" (clockwise = positive) from the direction of gravity in the screen plane.
        switch (getWindowManager().getDefaultDisplay().getRotation()) {
            case Surface.ROTATION_90:  th = Math.toDegrees(Math.atan2(ay, Math.abs(ax))); break;
            case Surface.ROTATION_270: th = Math.toDegrees(Math.atan2(-ay, Math.abs(ax))); break;
            case Surface.ROTATION_180: th = Math.toDegrees(Math.atan2(ax, Math.abs(ay))); break;
            default:                   th = Math.toDegrees(Math.atan2(-ax, Math.abs(ay))); break;
        }
        if (tiltFirst) { tiltSmooth = (float) th; tiltFirst = false; }
        tiltSmooth += 0.25f * ((float) th - tiltSmooth);
        long now = System.currentTimeMillis();
        if (now - lastTiltSend < 33) return;
        lastTiltSend = now;
        web.evaluateJavascript(String.format(Locale.US, "window.__tilt&&window.__tilt(%.1f)", tiltSmooth), null);
    }

    @Override public void onAccuracyChanged(Sensor s, int accuracy) {}
}

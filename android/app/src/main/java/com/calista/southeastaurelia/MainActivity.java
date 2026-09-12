package com.calista.southeastaurelia;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register custom Capacitor plugins here
        this.loadPlugin(MyPlugin.class);
    }
}

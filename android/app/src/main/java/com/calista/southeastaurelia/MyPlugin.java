package com.calista.southeastaurelia;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;

public class MyPlugin extends Plugin {
    @PluginMethod
    public void openUrl(PluginCall call) {
        String url = call.getString("url");
        if (url != null) {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            getActivity().startActivity(intent);
            call.resolve();
        } else {
            call.reject("URL is required");
        }
    }
}

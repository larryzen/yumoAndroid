package com.yumo.ui.arch;

import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.LifecycleOwner;
import androidx.lifecycle.OnLifecycleEvent;
import android.content.res.Configuration;

public interface YmLifeCycle extends LifecycleObserver {

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    public void create(LifecycleOwner lifecycleOwner);

    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    public void start(LifecycleOwner lifecycleOwner);

    @OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
    public void resume(LifecycleOwner lifecycleOwner);


    @OnLifecycleEvent(Lifecycle.Event.ON_PAUSE)
    public void pause(LifecycleOwner lifecycleOwner);

    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    public void stop(LifecycleOwner lifecycleOwner);


    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    public void destroy(LifecycleOwner lifecycleOwner);

//    @OnLifecycleEvent(Lifecycle.Event.ON_ANY)
//    public void any(LifecycleOwner lifecycleOwner) {
//        LogUtil.i(TAG, "any: " + lifecycleOwner.getLifecycle().getCurrentState());
//    }

    public void onConfigurationChanged(Configuration newConfig);
}

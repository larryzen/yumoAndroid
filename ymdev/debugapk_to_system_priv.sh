adb shell mount -o rw,remount /system
adb push build/outputs/apk/debug/ymdev-debug.apk /system/priv-app/ymdev-debug.apk
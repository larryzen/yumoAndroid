package com.yumodev.process;

import com.yumo.demo.entry.YmPackageInfo;
import com.yumo.demo.listener.IGetPackageData;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by yumo on 2018/3/30.
 */

public class TestPackageData implements IGetPackageData {
    @Override
    public List<YmPackageInfo> getPackageList() {
        List<YmPackageInfo> list = new ArrayList<>();
        list.add(new YmPackageInfo("sensor", "com.yumodev.process.sensor"));
        return null;
    }
}

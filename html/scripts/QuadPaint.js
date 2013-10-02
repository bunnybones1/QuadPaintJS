define([
    'Class',
    'core/BaseObject',
    'Global'
], function (
    Class,
    BaseObject,
    Global
) {
    var QuadPaint = new Class({
        Extends: BaseObject,
        initialize:function(values) {
            console.log("hello world");
        }
    });
    return QuadPaint;
});

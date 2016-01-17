/**
 * Created by xgfd on 01/01/2016.
 */

Template.entryList.rendered = function () {

    let options = [{
        selector: 'a.load-more',
        offset: 50,
        //on display tooltip won't dismiss after loading more, manually hide any on display tooltip
        callback: "$('a.load-more').click(); $('.material-tooltip[style]').hide();",
        //repeat not working yet, wait for update
        repeat: true
    }];
    //override scrollFire to support repeat
    Materialize.scrollFire = function (options) {

        var didScroll = false;

        window.addEventListener("scroll", function () {
            didScroll = true;
        });

        // Rate limit to 100ms
        setInterval(function () {
            if (didScroll) {
                didScroll = false;

                var windowScroll = window.pageYOffset + window.innerHeight;

                for (var i = 0; i < options.length; i++) {
                    // Get options from each line
                    var value = options[i];
                    var selector = value.selector,
                        offset = value.offset,
                        callback = value.callback,
                        repeat = value.repeat;

                    var currentElement = document.querySelector(selector);
                    if (currentElement !== null) {
                        var elementOffset = currentElement.getBoundingClientRect().top + window.pageYOffset;

                        if (windowScroll > (elementOffset + offset)) {
                            if (repeat || value.done !== true) {
                                var callbackFunc = new Function(callback);
                                callbackFunc();
                                value.done = true;
                            }
                        }
                    }
                }
            }
        }, 100);
    }
    Materialize.scrollFire(options);
};

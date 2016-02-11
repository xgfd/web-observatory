/**
 * Created by eugenesiow on 10/02/2016.
 */

Template.menu.rendered = function() {
    /* Off-Canvas Menu */
    (function () {

        var bodyEl = document.body,
            content = document.querySelector('.content-wrap'),
            openbtn = document.getElementById('open-button'),
            closebtn = document.getElementById('close-button'),
            menuCloser = document.querySelectorAll('.menu-closer'),
            isOpen = false;

        function init() {
            initEvents();
        }

        function initEvents() {
            openbtn.addEventListener('click', toggleMenu);
            if (closebtn) {
                closebtn.addEventListener('click', toggleMenu);
            }

            // close the menu element if the target it´s not the menu element or one of its descendants..
            content.addEventListener('click', function (ev) {
                var target = ev.target;
                if (isOpen && target !== openbtn) {
                    toggleMenu();
                }
            });

            [].forEach.call(menuCloser, function(closer) {
                closer.addEventListener('click', toggleMenu);
            });
        }

        function toggleMenu() {
            if (isOpen) {
                classie.remove(bodyEl, 'show-menu');
            }
            else {
                classie.add(bodyEl, 'show-menu');
            }
            isOpen = !isOpen;
        }

        init();

    })();
};
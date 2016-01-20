/**
 * Created by xgfd on 02/01/2016.
 */
//scroll to top
Tracker.autorun(function () {
    var current = Router.current();
    Tracker.afterFlush(function () {
        $(window).scrollTop(0);
    });
});

fileUpload = function (e, template) {
    let $file = $(e.target),
        $root = $file.closest('div.card-content'),
        $fileUpload = $file.closest('.fileUpload'),
        session = $fileUpload.attr('data-schema-key'),
        $urlInput = $root.find('input[name*=\\.url]'),
        $urlLable = $urlInput.next(),
    //to be more generic
        isDataset = template && template.data && template.data.category && template.data.category.singularName === 'dataset';

    let $format, $formatUl, $fileOpt, $noneOpt;

    if (isDataset) {
        $format = $root.find('select[name*=\\.fileFormat]');
    }

    Tracker.autorun(function () {
            let file = Session.get('file' + session);

            if (file && file.url) {
                let url = $('<a href="' + file.url + '"></a>').prop('href');
                $urlInput.val(url);
                $urlInput.attr('readonly', '');
                $urlLable.addClass('active');

                if (isDataset) {
                    $format.attr('disabled', ''); //readonly doesn't work, use disabled and set fileFormat in before hook
                    $format.material_select();
                    $formatUl = $root.find('ul.dropdown-content');
                    $fileOpt = $formatUl.find('li:contains("File")');
                    $fileOpt.click();
                }
            } else {
                $urlInput.val(null);
                $urlInput.removeAttr('readonly');

                if (isDataset) {
                    $format.removeAttr('disabled');
                    $format.material_select();
                    $formatUl = $root.find('ul.dropdown-content');
                    $noneOpt = $formatUl.find('li:contains("(Select One)")');
                    $noneOpt.click();
                }
            }
        }
    );
};

formatChange = function (e) {
    let $select = $(e.target),
        val = $select.val(),
        $root = $select.closest('div.card-content'),
        $url = $root.find('input[name*=\\.url]'),
        $file = $root.find('.fileUpload'),
        $fileSection = $file.closest('.row');

    switch (val) {
        case 'HTML':
            $url.attr('placeholder', '["http://" | "https://"] host ["/" path] ["?" query]');
            $fileSection.hide();
            break;
        case 'SPARQL':
            $url.attr('placeholder', '["http://" | "https://"] host ["/" path]');
            $fileSection.hide();
            break;
        case 'MySQL':
            $url.attr('placeholder', '"mysql://" host "/" db');
            $fileSection.hide();
            break;
        case 'MongoDB':
            $url.attr('placeholder', '"mongodb://" host [":" port] "/" db');
            $fileSection.hide();
            break;
        case 'AMQP':
            $url.attr('placeholder', '("amqp://" | "amqps://") host [":" port] ["/" vhost] "?exchange=" exchange_name');
            $fileSection.hide();
            break;
        case 'File':
            $url.attr('placeholder', 'Leave this blank. A URL will be generated after you upload a file.');
            $fileSection.show();
            break;
        default:
            $url.attr('placeholder', 'Please select a format');
            $fileSection.hide();
    }
};

hideFileUpload = function () {
    let $file = $('.fileUpload'),
        $fileSection = $file.closest('.row');

    $fileSection.hide();
};
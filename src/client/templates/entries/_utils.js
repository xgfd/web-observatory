/**
 * Created by xgfd on 02/01/2016.
 */

fileUpload = function (e, template) {
    let target = $(e.target),
        $fileUpload = target.closest('.fileUpload'),
        session = $fileUpload.attr('data-schema-key'),
        $urlInput = target.closest('.row').prev().find('input[type=url]'),
        $urlLable = $urlInput.next(),
    //to be more generic use
        isDataset = template && template.data && template.data.category && template.data.category.singularName === 'dataset';

    if (isDataset) {
        let $formatInput = target.closest('.row').siblings().has('input.select-dropdown').find('input.select-dropdown'),
            $formatUl = target.closest('.row').siblings().has('ul.dropdown-content').find('ul.dropdown-content'),
            $formatFile = $formatUl.find('li:contains("File")'),
            $formatNone = $formatUl.find('li:contains("(Select One)")');
    }

    Tracker.autorun(function () {
            let file = Session.get('file' + session);

            if (file && file.url) {
                let url = $('<a href="' + file.url + '"></a>').prop('href');
                $urlInput.val(url);
                $urlInput.attr('readonly', '');
                $urlLable.addClass('active');

                if (isDataset) {
                    //$formatInput.val('File');
                    $formatFile.click();
                    $formatInput.attr('readonly', '');
                }
            } else {
                $urlInput.val(null);
                $urlInput.removeAttr('readonly');

                if (isDataset) {
                    //$formatInput.val('(Select One)');
                    $formatNone.click();
                    $formatInput.removeAttr('readonly');
                }
            }
        }
    );
}

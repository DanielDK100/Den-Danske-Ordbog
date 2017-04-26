var soegetekst = $('#soegetekst');
$('html').css('height', 0);
soegetekst.keyup(function(event) {
    $('html').css('height', 0);
    $.getJSON(konfiguration.urlAutocomplete, {text: soegetekst.val(), size: 10}, function(response) {
        soegetekst.autocomplete({
          source: response,
          autoFocus: true,
          classes: {
            'ui-autocomplete': 'notranslate'
        },
        select: function(event, ui) {
            soegetekst.val(ui.item.value).trigger('input').blur();
        },
        open: function(event, ui) {
            $('.container').css('minHeight', $('.ui-autocomplete').height() + 105);
        },
        close: function(event, ui) {
            $('.container').css('minHeight', 0);
            soegetekst.focus();
        }
    });
    });
});
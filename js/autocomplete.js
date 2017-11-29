var soegetekst = $('#soegetekst');
soegetekst.on('input', function() {
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
            $('.container').css('minHeight', $('.ui-autocomplete').height() + $('#soegehjaelp').height() + 105);
        },
        close: function(event, ui) {
            $('.container').css('minHeight', 0);
            soegetekst.focus();
        }
    });
    });
});
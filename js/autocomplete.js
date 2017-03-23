var soegetekst = $('#soegetekst');
$(soegetekst).keyup(function(event) {
        $.getJSON('http://ordnet.dk/ws/ddo/livesearch', {text: soegetekst.val(), size: 10}, function(response) {
        soegetekst.autocomplete({
          source: response,
          autoFocus: true,
          select: function(event, ui) {
            $(soegetekst).val(ui.item.value).blur();
        },
        open: function(event, ui) {
            $('.container').css('minHeight', $('.ui-autocomplete').height() + 105);
        },
        close: function(event, ui) {
            $('.container').css('minHeight', 0);
        }
    });
    });
});
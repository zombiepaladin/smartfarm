ready = function() {
    var hidden = false;

    $('#navbar-toggle').click( function() {
        if(hidden) {
            $('nav.navbar').animate({top: '0px'});
            hidden = false;
            $('#navbar-toggle .up').show();
            $('#navbar-toggle .down').hide();    
        } else {
            $('nav.navbar').animate({top: '-50px'});
            hidden = true;
            $('#navbar-toggle .up').hide();
            $('#navbar-toggle .down').show();
        }
    });

    $(document).on('smartfarm:fullscreen', function() {
        $('nav.navbar').animate({top: '-50px'});
        $('#navbar-toggle').show();
        hidden = true;
        $('#navbar-toggle .up').hide();
        $('#navbar-toggle .down').show();
    });

    $(document).on('smartfarm:windowed', function() {
        hidden = false;
        $('nav.navbar').animate({top: '0px'});
        $('#navbar-toggle').hide();
    });

    $(document).on('smartfarm:savecrop', function(event) {
        var id = $('#crop-editor').data('crop-id');

        console.log("Save crop event caught");
        console.log(event);
        console.log(event.originalEvent.detail);

        $.post('/crops/' + id, {
            data: event.originalEvent.detail,
            dataType: 'json',
            success: function(){ alert("Saved!");}
        });
    });

}

$(document).ready(ready);
$(document).on('page:load', ready);

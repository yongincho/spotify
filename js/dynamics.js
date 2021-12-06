// **********  fullPage  ********** //
let myFullpage = new fullpage('#fullpage', {
    navigation: true,
    navigationPosition: 'right',

    onLeave: function(origin, destination, direction) {
        var origId = origin.item.getAttribute('id');

        if(origId == "title-sec") {
            // show map section when user scrolls beyond title page (this is to prevent stack-loading in first page!)
            $('#map-container').css("display", "inline");
        }
    },

});

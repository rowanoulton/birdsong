$(function () {
    var bodyNode      = $('body'),
        containerNode = $('#container'),
        birdImgRaw    = new Image();
        birdImgNode   = $(birdImgRaw);
        bgImgNode     = containerNode.find('#background-img'),
        socket        = io.connect(location.origin),
        isSinging     = false;

    socket.on('welcome', function (data) {
        containerNode.append('<h1>Welcome, you have been assigned the ' + data.name + '.</h1>');

        // Load the background image before fading it in
        document.body.appendChild(birdImgRaw);
        birdImgNode.on('load', function () {
            // Once loaded, we can assign it to be the background image for our actual background
            bgImgNode.css('background-image', 'url(' + data.photo.url + ')');

            // Force a reflow to ensure animation works when class is applied
            // @todo: This still doesn't seem to work ocassionally and it is possibly tied to the viewport size.
            // The bigger the viewport, the less frequently the transition works as expected.
            bgImgNode.get(0).offsetWidth;
            bgImgNode.addClass('is-visible');

            // We're finished with the image, kill it
            birdImgNode.remove();
        });

        // We're ready to set the source and begin loading our background
        birdImgNode.hide();
        birdImgRaw.src = data.photo.url;
    });

    socket.on('sing', function (data) {
        var audioNode;

        console.log('Server has sent: ' + data.song);

        // Don't play more than one song at once
        if (!isSinging) {
            console.log('... and I can sing!');
            isSinging = true;

            audioNode = $('<audio></audio>', {
                autoplay: 'autoplay',
                src: data.song
            });

            audioNode.on('ended', function () {
                isSinging = false;
                audioNode.remove();
            });
        } else {
            console.log('... but I am already singing.');
        }
    });
});

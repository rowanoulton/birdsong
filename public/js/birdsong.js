$(function () {
    var bodyNode        = $('body'),
        containerNode   = $('#container'),
        bgImgNode       = $('#background-img'),
        headerNode      = containerNode.find('header'),
        footerNode      = containerNode.find('footer'),
        photoCreditNode = footerNode.find('#photo-credit'),
        birdImgRaw      = new Image();
        birdImgNode     = $(birdImgRaw);
        socket          = io.connect(location.origin),
        isSinging       = false;

    socket.on('welcome', function (data) {
        var titleNode  = headerNode.find('h1'),
            welcomeMsg = 'Welcome, you have been assigned the ' + data.name + '.';

        // Clear and hide the photo credit section
        photoCreditNode.empty().hide();

        // Ensures we don't re-add the welcome message if the server restarts
        if (titleNode.length) {
            // Update the existing welcome message
            titleNode.html(welcomeMsg);
        } else {
            // Create a new welcome message-
            headerNode.append('<h1>' + welcomeMsg + '</h1>');
        }

        // Load the background image before fading it in
        document.body.appendChild(birdImgRaw);
        birdImgNode.on('load', function () {
            if (data.photo.credit) {
                // Add photo credit line
                photoCreditNode.html('Photo: <a href="' + data.photo.credit.url + '" target="_blank">' + data.photo.credit.name + '</a>').show();
            }

            // Display the footer
            footerNode.addClass('is-visible');

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

$(function () {
    var containerNode = $('#container'),
        bgImgNode     = containerNode.find('#background-img'),
        socket        = io.connect('http://localhost');

    socket.on('welcome', function (data) {
        containerNode.append('<h1>Welcome, you have been assigned the ' + data.name + '.</h1>');
        bgImgNode.css('background-image', 'url(' + data.img + ')');
        // Force a reflow to ensure animation works when class is applied
        bgImgNode.get(0).offsetWidth;
        bgImgNode.addClass('is-visible');
    });
});

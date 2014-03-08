$(function () {
    // Globals
    var socket            = io.connect(location.origin),
        isSinging         = false;

    // Elements
    var Document          = $(document),
        bodyNode          = $('body'),
        aboutNode         = bodyNode.find('#about'),
        containerNode     = bodyNode.find('#container'),
        bgImgNode         = bodyNode.find('#background-img'),
        headerNode        = containerNode.find('header'),
        footerNode        = containerNode.find('footer'),
        photoCreditNode   = footerNode.find('#photo-credit'),
        aboutBtnNode      = footerNode.find('.js-about-btn'),
        aboutCloseBtnNode = aboutNode.find('#about-close-btn');

    // Function variables
    var handleAboutSectionOpen,
        handleAboutSectionClose,
        handleAboutSectionTransitionEnd,
        handleDocumentKeyup,
        handleWelcome,
        loadBackgroundImage,
        handleBackgroundImageLoadCompletion,
        handleSong,
        setWelcomeMessage,
        createAudioNode,
        isAboutSectionVisible,
        hideAboutSection,
        reflowNode;

    /**
     * Open modal window containing about section
     *
     * Also disables scrolling on the body content underneath
     *
     * @method handleAboutSectionOpen
     * @param  {Object} event
     */
    handleAboutSectionOpen = function (event) {
        bodyNode.addClass('prevent-scroll');
        aboutNode.show();
        reflowNode(aboutNode);
        aboutNode.addClass('is-visible');

        event.preventDefault();
    };

    /**
     * Begin transition to close the modal window containing the about section
     *
     * @method handleAboutSectionClose
     * @param  {Object} event
     */
    handleAboutSectionClose = function (event) {
        if (isAboutSectionVisible()) {
            hideAboutSection();
        }

        event.preventDefault();
    };

    /**
     * Handle the completion of the modal window transition
     *
     * If the transition is the modal fading out, we complete the closure
     * process by hiding it and enabling scrolling of the body content again
     *
     * @method handleAboutSectionTransitionEnd
     */
    handleAboutSectionTransitionEnd = function () {
        if (!isAboutSectionVisible()) {
            aboutNode.hide();
            bodyNode.removeClass('prevent-scroll');
        }
    };

    /**
     * Handle keypresses anywhere in the whole document
     *
     * If the escape key is pressed and the about section is visible, we need to
     * close it
     *
     * @method handleDocumentKeyup
     * @param  {Object} event
     */
    handleDocumentKeyup = function (event) {
        // React to the escape key if the about modal is visible
        if (event.keyCode === 27 && isAboutSectionVisible()) {
            hideAboutSection();
        }
    };

    /**
     * Handle a welcome event received from the server
     *
     * We need to add a welcome message to the DOM, set and load the
     * background image.
     *
     * @method handleWelcome
     * @param  {Object} data
     *         @param {String} data.name  Name of the bird assigned to the client
     *         @param {Object} data.photo
     *                @param {String} data.photo.url      Address of the image asset
     *                @param {Object} [data.photo.credit] Optional configuration containing attribution details
     *                       @param {String} [data.photo.credit.name] Name of the photographer
     *                       @param {String} [data.photo.credit.url]  Website of the photographer
     */
    handleWelcome = function (data) {
        // Clear and hide the photo credit section
        photoCreditNode.empty().hide();

        // Set (or update) the welcome message
        setWelcomeMessage('Welcome, you have been assigned the ' + data.name + '.');

        // Load the background image before fading it in
        loadBackgroundImage(data.photo);
    };

    /**
     * Begin loading background image in a hidden element
     *
     * @method loadBackgroundImage
     * @param {Object} photo
     *        @param {String} photo.url      Address of the image asset
     *        @param {Object} [photo.credit] Optional configuration containing attribution details
     *               @param {String} [photo.credit.name] Name of the photographer
     *               @param {String} [photo.credit.url]  Website of the photographer
     */
    loadBackgroundImage = function (photo) {
        var birdImgRaw  = new Image(),
            birdImgNode = $(birdImgRaw);

        document.body.appendChild(birdImgRaw);

        birdImgNode.on('load', handleBackgroundImageLoadCompletion.bind(this, photo, birdImgNode));

        // We're ready to set the source and begin loading our background
        birdImgNode.hide();
        birdImgRaw.src = photo.url;
    };

    /**
     * Handle finishing load of background image.
     *
     * Displays the credit line of the photographer, fades the background image in
     * and removes the hidden element we used to preload the image.
     *
     * This process is required so that the animation doesn't fire before the image
     * has finished loading (which looked crappy)
     *
     * @method handleBackgroundImageLoadCompletion
     * @param {Object} photo
     *        @param {String} photo.url      Address of the image asset
     *        @param {Object} [photo.credit] Optional configuration containing attribution details
     *               @param {String} [photo.credit.name] Name of the photographer
     *               @param {String} [photo.credit.url]  Website of the photographer
     * @param {Node} loadImgNode The hidden element used to preload the image
     */
    handleBackgroundImageLoadCompletion = function (photo, loadImgNode) {
        if (photo.credit) {
            // Add photo credit line
            photoCreditNode.html('Photo: <a href="' + photo.credit.url + '" target="_blank">' + photo.credit.name + '</a>').show();
        }

        // Display the footer
        footerNode.addClass('is-visible');

        // Once loaded, we can assign it to be the background image for our actual background
        bgImgNode.css('background-image', 'url(' + photo.url + ')');

        // Force a reflow to ensure animation works when class is applied
        // @todo: This still doesn't seem to work ocassionally and it is possibly tied to the viewport size.
        // The bigger the viewport, the less frequently the transition works as expected.
        reflowNode(bgImgNode);
        bgImgNode.addClass('is-visible');

        // We're finished with the image, kill it
        loadImgNode.remove();
    };

    /**
     * Handle a song sent from the server
     *
     * If the client isn't already playing a song, we start playing it
     *
     * @method handleSong
     * @param  {Object} data
     *         @param {String} data.song URL of the birdsong to play
     */
    handleSong = function (data) {
        console.log('Server has sent: ' + data.song);

        // Don't play more than one song at once
        if (!isSinging) {
            console.log('... and I can sing!');
            isSinging = true;
            createAudioNode(data.song);
        } else {
            console.log('... but I am already singing.');
        }
    };

    /**
     * Add or update the welcome message shown to the user.
     *
     * This welcome message contains the name of the currently assigned bird
     *
     * @method setWelcomeMessage
     * @param {String} msg The welcome message in its entirety
     */
    setWelcomeMessage = function (msg) {
        var titleNode = headerNode.find('h1');

        // Ensures we don't re-add the welcome message if the server restarts
        if (titleNode.length) {
            // Update the existing welcome message
            titleNode.html(msg);
        } else {
            // Create a new welcome message
            headerNode.append('<h1>' + msg + '</h1>');
        }
    };

    /**
     * Creates an HTML5 Audio element as a jQuery element with the provided source
     *
     * The element is not added to the DOM, however it doesn't appear that it needs
     * to be in order for it to play. Once it has completed playing, we remove it
     * (@todo: Is this necessary?) and unset the boolean flag to say that the
     * client is no longer playing a song.
     *
     * @method createAudioNode
     * @param  {String} song URL of the birdsong to play
     */
    createAudioNode = function (song) {
        var audioNode = $('<audio></audio>', {
            autoplay: 'autoplay',
            src: song
        });

        audioNode.on('ended', function () {
            isSinging = false;
            audioNode.remove();
        });
    };

    /**
     * Check if the modal window containing the about section is visible
     *
     * @method isAboutSectionVisible
     * @return {Boolean}
     */
    isAboutSectionVisible = function () {
        return aboutNode.hasClass('is-visible');
    };

    /**
     * Hide the modal window containing the about section
     *
     * Note: This removes the visiblity class which begins the fade-out animation
     * via CSS. There is an event listener external to this method which handles
     * the final step of actually hiding the about section once the transition
     * has finished. See handleAboutSectionTransitionEnd method for more details.
     *
     * @method hideAboutSection
     */
    hideAboutSection = function () {
        aboutNode.removeClass('is-visible');
    };

    /**
     * Force a reflow of the provided node.
     *
     * This is used to ensure CSS animations trigger properly.
     *
     * @method reflowNode
     * @param  {Node} node
     */
    reflowNode = function (node) {
        node.get(0).offsetWidth;
    };

    // Bindings
    aboutBtnNode.on('click', handleAboutSectionOpen);
    aboutCloseBtnNode.on('click', handleAboutSectionClose);
    aboutNode.on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', handleAboutSectionTransitionEnd);
    Document.on('keyup', handleDocumentKeyup);
    socket.on('welcome', handleWelcome);
    socket.on('sing', handleSong);
});

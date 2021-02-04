// Utils
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

// Found here to manipulate cookies: https://stackoverflow.com/questions/14573223/set-cookie-and-get-cookie-with-javascript
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

// Open the menu overlay on click
function header() {
    var menuBtn = document.getElementById('menu-icon');
    // Prevent page breaking on Maintenance page. Because menuBtn don't exist, it breaks the page
    if(menuBtn == null) return;
    menuBtn.addEventListener('click', function(e) {
        if (!menuBtn.classList.contains('is-active')) {
            menuBtn.classList.add('is-active');
            document.body.classList.add('with-menu');
        } else {
            menuBtn.classList.remove('is-active');
            document.body.classList.remove('with-menu');
        }
    });
}

// Vanilla JS Smooth Scroll
function scrollTo() {
	var links = document.querySelectorAll('.scroll');
	links.forEach(function (each) {
      each.onclick = scrollAnchors
  });
}

function scrollAnchors(e, respond) {
	var distanceToTop = function(el) { return Math.floor(el.getBoundingClientRect().top) };
	e.preventDefault();
  var targetID = (respond) ? respond.getAttribute('href') : this.getAttribute('href');
  var targetAnchor = document.querySelector(targetID);
	if (!targetAnchor) return;
  var originalTop = distanceToTop(targetAnchor);
  // Need some adjustment because of navbar. TODO: mobile navbar is narrower
  window.scrollBy({ top: originalTop - 84, left: 0, behavior: 'smooth' });
	var checkIfDone = setInterval(function() {
		var atBottom = window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2;
		if (distanceToTop(targetAnchor) === 0 || atBottom) {
			targetAnchor.tabIndex = '-1';
			targetAnchor.focus();
			window.history.pushState('', '', targetID);
			clearInterval(checkIfDone);
		}
	}, 100);
}

function homeSlider() {
    // Infinite slider that slides and stops on hover.
    var hovered = false,
        dragOffset = 0; 
        offset = 0;
    var viewportWidth = window.innerWidth;
    // A bit arbitrary, but the wider the screen, the less fast we want it to scroll.
    var offsetUnit = -100 / viewportWidth;
    var carousel = document.getElementById('carousel');
    if (!carousel) return;
    carousel.style.width =  viewportWidth  + 'px';
    var slides = document.getElementsByClassName('home-slides');
    var nbSlides = slides.length;

    // Proportion of the screen used by one slide.
    var slideWidthProportion = (slides[0].offsetWidth / viewportWidth) * 100;
    // Using the concept of units to make sure that we can calculate at which slide we are
    // without comparing percentage offset (that can be unprecise).
    var offsetUnitsPerSlide = -(Math.round(slideWidthProportion / offsetUnit));

    // Position the slide initially.
    for (let i = 0; i < nbSlides; i++) {
        slides[i].style.left = (slideWidthProportion * i) + '%';
    }

    function placeFirstSlides(startingPosition) {
        slides[0].style.left = (slideWidthProportion * startingPosition) + '%';
        slides[1].style.left = (slideWidthProportion * (startingPosition + 1)) + '%';
    }

    function placeLastSlides(startingPosition) {
        slides[nbSlides-3].style.left = (slideWidthProportion * startingPosition) + '%';
        slides[nbSlides-2].style.left = (slideWidthProportion * (startingPosition+1)) + '%';
        slides[nbSlides-1].style.left = (slideWidthProportion * (startingPosition+2)) + '%';
    }

    function infiniteScroll() {
        if (hovered) {
            return;
        }
        offset += 1;

        // Built using 8 slides.
        // Once the first 2 slides aren't visible, we move them at the end.
        if (offset === offsetUnitsPerSlide * 2) {
            placeFirstSlides(nbSlides);
        } else if (offset === offsetUnitsPerSlide * (nbSlides - 3)) {
            // Just before hiding the 4th last slide, we should see the last 2 slides + 2 first slides
            // Reposition the first 2 slides in the "beginning" of their container
            placeFirstSlides(0);
            // Position the last 3 slides "before" the beginning of their container.
            placeLastSlides(-3);
            // Slide the container the see before it. The first visible slide should be the second last.
            offset = -offsetUnitsPerSlide*3;
        } else if (offset === 0) {
            // Once we are back at the beginning, we can reposition the last slides at the end
            placeLastSlides(nbSlides - 3);
        }

        // The translation gives the impression of movement.
        carousel.style.transform = 'translateX('+(offset * offsetUnit)+'%)';
    }

    // Translate the container
    setInterval(infiniteScroll, 10);

    carousel.addEventListener("mouseenter", function() {
        //preload DRAGGING cursor before mousedown, so there no delay on click
        draggingCursor = new Image();
        draggingCursor.src ='/img/cursor/DRAGGING.svg';
        hovered = true;
    });

    carousel.addEventListener("mouseleave", function() {
        hovered = false;
    });

    carousel.addEventListener("mousedown", function (e) {
        e.preventDefault();
        carousel.style.cursor = `url(${draggingCursor.src}), auto`; //Because of the preventDefault, we have to force change the cursor
        canDrag = true;
        dragOffset = e.clientX - carousel.getBoundingClientRect().left - offset;
        document.onmousemove = dragCarousel;
    });

    document.addEventListener("mouseup", function () {
        canDrag = false;
        carousel.style.cursor = "url('/img/cursor/DRAGGABLE.svg'), auto";
    });

    function dragCarousel(e){
        if(!canDrag) return
        carousel.style.left = e.pageX - dragOffset + 'px';
    }
}

function mobileMenu(){
    var collapseTrigger = document.getElementsByClassName('has-sublinks');
    for(let i = 0 ; i < collapseTrigger.length ; i++){
        collapseTrigger[i].firstElementChild.addEventListener('click', (e) => {
            e.preventDefault();
            collapseTrigger[i].classList['toggle']('opened');
        });
    }
}

function home() {
    homeSlider();
}

function icons() {
    var icon = document.getElementById('service-icon');
    if (!icon) {
        return;
    }
    var anim = bodymovin.loadAnimation({
        container: icon, // Required
        path: '/animations/test.json', // Required
        renderer: 'svg', // Required
        loop: false, // Optional
        autoplay: false, // Optional
    });
    icon.addEventListener('mouseenter', function(e) {
        anim.play();
    });
    icon.addEventListener('mouseleave', function(e) {
        anim.stop();
    }); 
}

function bouncingBall(){
    var container = document.getElementById('cta-section');
    var ball = document.getElementById('ballObject');
    var resize = false;
    var resizeTimelapse;
    let canvas = {
        element: document.getElementById('canvas'),
        width: container.offsetWidth, // Get the current container Width
        height: container.offsetHeight, // Get the current container Height
        initialize: function () {
            this.element.style.width = this.width + 'px';
            this.element.style.height = this.height + 'px';
        }
    };
    var Ball = {
        colors: ['#0038FF', '#72FF71', '#B494F7', '#DBFC7D', '#FE2611', '#FFCDF3', '#FFBE41'],
        currentCol: null,
        // Ball constructor on initialize
        initialize: function (dx, dy, size) {
            Object.create(this);
            this.dx = dx;
            this.dy = dy;
            this.width = size;
            this.height = size;
            this.element = ball;
            ball.style.width = this.width + 'px';
            ball.style.height = this.height + 'px';
            return this;
        },
        direction: function (x, y) {
            // Set the ball direction
            ball.style.left = x + 'px';
            ball.style.top = y + 'px';
            // Check for x and y axis collision. If it hits, change color and swap direction
            if (x < 0 || x > canvas.width - this.width) {
                this.randomColor();
                this.dx = -this.dx;
            }
            if (y < 0 || y > canvas.height - this.height) {
                this.randomColor();
                this.dy = -this.dy;
            }
        },
        randomColor: function () {
            // Get a random number from the colors list
            randomNumber = Math.floor(Math.random() * this.colors.length);

            // Set the ball color and save the color has current color
            ball.style.backgroundColor = this.colors[randomNumber];
            currentCol = this.colors[randomNumber];
        },
        draw: function (x, y) {
            // reassign this
            var _this  = this;

            // Update the ball direction
            this.direction(x, y);

            // Loop this fucntion to constantly update ball position
            setTimeout(function () {
                // There,s a bug when we resize the windows, the ball glitch on the side. To prevent that (for now) reset the position to the new canvas size position
                if (resize) {
                    x = canvas.width / 2;
                    y = canvas.height / 2;
                }
                // Draw the new ball position every 16.6ms
                _this.draw(x + _this.dx, y + _this.dy);
            }, 1000 / 60);
        }
    };

    // Check for resize windows
    window.onresize = function () {
        // Resize the canvas bound when windows resize
        canvas.width = container.offsetWidth;
        canvas.initialize();
        // Asign resize to true and clear the current timout
        resize = true;
        clearTimeout(resizeTimelapse);
        // Check for when the event stop and asign resize to false
        resizeTimelapse = setTimeout(function () {
            resize = false;
        }, 100);
    };

    // Init the canvas
    canvas.initialize();
    // Init ball
    Ball.initialize(3, 3, 252).draw(canvas.width / 2, canvas.height / 2);
}

(function() {
    scrollTo();
    header();
    home();
    icons();
    mobileMenu();
    bouncingBall();
})();

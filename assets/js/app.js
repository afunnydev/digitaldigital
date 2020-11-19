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
        offset = 0,
        offsetUnit = -0.05;
    var viewportWidth = window.innerWidth;
    var carousel = document.getElementById('carousel');
    if (!carousel) return;
    
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
        hovered = true;
    });

    carousel.addEventListener("mouseleave", function() {
        hovered = false;
    });
}

function home() {
    homeSlider();
}

(function() {
    scrollTo();
    header();
    home();
})();

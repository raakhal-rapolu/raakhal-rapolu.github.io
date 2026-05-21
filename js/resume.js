(function($) {
  "use strict";

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy
  $('body').scrollspy({
    target: '#sideNav'
  });

  // Animated stat counters
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var duration = 1600;
    var start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  // Scroll-triggered fade-in and counter animation via IntersectionObserver
  if ('IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-in').forEach(function(el) {
      fadeObserver.observe(el);
    });

    var statsObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          document.querySelectorAll('.stat-number[data-target]').forEach(animateCounter);
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.5 });

    var statsRow = document.querySelector('.stats-row');
    if (statsRow) statsObserver.observe(statsRow);
  } else {
    // Fallback: show all fade-in elements immediately
    document.querySelectorAll('.fade-in').forEach(function(el) {
      el.classList.add('visible');
    });
    document.querySelectorAll('.stat-number[data-target]').forEach(function(el) {
      el.textContent = el.getAttribute('data-target');
    });
  }

})(jQuery);

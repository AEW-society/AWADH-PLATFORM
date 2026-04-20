(function() {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function() {
      if (nav.className.indexOf('open') === -1) {
        nav.className += ' open';
      } else {
        nav.className = nav.className.replace(/\s?open/g, '');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-upload-field]')).forEach(function(field) {
    var fileInput = field.querySelector('[data-upload-input]');
    var target = field.querySelector('[data-upload-target]');
    var status = field.querySelector('[data-upload-status]');

    if (!fileInput || !target) {
      return;
    }

    fileInput.addEventListener('change', function(event) {
      var file = event.target.files && event.target.files[0];
      var reader;

      if (!file) {
        target.value = '';
        if (status) {
          status.textContent = 'No file selected yet.';
        }
        return;
      }

      reader = new FileReader();
      reader.onload = function(loadEvent) {
        target.value = loadEvent.target.result;
        if (status) {
          status.textContent = file.name + ' ready to upload.';
        }
      };
      reader.readAsDataURL(file);
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-counter]')).forEach(function(counter) {
    var raw = counter.textContent || '';
    var numeric = parseInt(raw.replace(/[^0-9]/g, ''), 10);
    var suffix = raw.replace(/[0-9]/g, '');
    var current = 0;
    var step;
    var timer;

    if (isNaN(numeric) || !numeric) {
      return;
    }

    step = Math.max(1, Math.ceil(numeric / 40));
    counter.textContent = '0' + suffix;

    timer = window.setInterval(function() {
      current += step;
      if (current >= numeric) {
        current = numeric;
        window.clearInterval(timer);
      }
      counter.textContent = current + suffix;
    }, 28);
  });
}());

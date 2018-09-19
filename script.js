const apiKey = 'RtxDzjpOcFIPIEpEq47UPXDcjcPi1UF4QS4sgz6J';

function configureCalendar() {

  function Calendar(target, date, data) {
    let calendar;
    let container;

    switch (typeof date) {
      case 'string':
        date = date.split('-');
        date = new Date(date[0], parseInt(date[1], 10) - 1, date[2]);
        break;
      case 'undefined':
        date = new Date();
        break;
      case 'object':
        if (date instanceof Array) {
          data = date;
          date = new Date()
        } else {
          date = date
        }
        break;
      default:
        throw 'Invalid date type!'
    }

    const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"];

    container = document.querySelector(target);

    let title = buildTitle(date);
    container.appendChild(title);
    calendar = buildTable(date.getFullYear(), date.getMonth());
    container.appendChild(calendar);
    container.appendChild(buildControls(date));

    function buildTitle(date) {
      const title = newElement('div');
      title.setAttribute('class', 'title');
      const monthTitle = newElement('div');
      monthTitle.innerText = monthsOfYear[date.getMonth()];
      const yearTitle = newElement('div');
      yearTitle.innerText = date.getFullYear();
      title.appendChild(monthTitle);
      title.appendChild(yearTitle);
      return title;
    }

    function buildTable(year, month) {
      let controlDate = new Date(year, month + 1, 0);
      let currDate = new Date(year, month, 1);
      let iter = 0;
      let ready = true;

      const table = newElement('table');
      const thead = newElement('thead');
      const tbody = newElement('tbody');
      let tr;

      if (currDate.getDay() !== 0) {
        iter = 0 - currDate.getDay()
      }

      while (ready) {
        if (currDate.getDay() === 6) {
          if (tr) {
            tbody.appendChild(tr)
          }
          tr = null
        }

        if (!tr) {
          tr = newElement('tr')
        }

        currDate = new Date(year, month, ++iter);

        tr.appendChild(newDayCell(currDate, iter < 1 || +currDate > +controlDate));

        if (+controlDate < +currDate && currDate.getDay() === 0) {
          ready = false
        }

      }

      thead.innerHTML = '<tr>' +
        '<th class="day">Sun</th>' +
        '<th class="day">Mon</th>' +
        '<th class="day">Tue</th>' +
        '<th class="day">Wed</th>' +
        '<th class="day">Thu</th>' +
        '<th class="day">Fri</th>' +
        '<th class="day">Sat</th>' +
        '</tr>';

      table.appendChild(thead);
      table.appendChild(tbody);

      table.className = 'calendar';
      table.setAttribute('cellspacing', '0px');
      table.setAttribute('cellpadding', '0px');
      table.setAttribute('data-period', year + '-' + (month));

      return table
    }

    function newDayCell(dateObj, isOffset) {
      const td = newElement('td');
      const number = newElement('span');
      let isoDate = dateObj.toISOString();
      isoDate = isoDate.slice(0, isoDate.indexOf('T'));

      const natural = newElement('a')
      natural.innerText = 'Natural'
      const enhanced = newElement('a')
      enhanced.innerText = 'Enhanced'
      addEventListener(natural, 'click', () => fetchNaturalDataForDate(isoDate))
      addEventListener(enhanced, 'click', () => fetchEnhancedDataForDate(isoDate))


      number.innerHTML = dateObj.getDate();
      td.className = isOffset ? 'day adj-month' : 'day';
      td.setAttribute('data-date', isoDate);

      td.appendChild(number);

      for (let i = 0; i < data.length; i++) {
        if (data[i].date === isoDate) {
          const item = newElement('span');
          item.style.backgroundColor = data[i].color;
          item.className = 'calendar-item';
          td.appendChild(item)
        }
      }

      const links = newElement('div')
      links.setAttribute('class', 'links')
      links.appendChild(natural)
      links.appendChild(enhanced)
      td.appendChild(links)

      return td
    }

    function fetchNaturalDataForDate(date) {
      fetch(`https://api.nasa.gov/EPIC/api/natural/date/${date}?api_key=${apiKey}`, {})
        .then(res => res.json()) // parse response as JSON (can be res.text() for plain response)
        .then(response => {
          const container = document.getElementById('image-results')
          const slideShow = automateSlideShow(response)
          container.appendChild(slideShow)
          console.log(response)
        })
        .catch(err => {
          console.log(err)
          alert("sorry, there are no results for your search")
        });
    }

    function fetchEnhancedDataForDate(date) {
      fetch(`https://api.nasa.gov/EPIC/api/enhanced/date/${date}?api_key=${apiKey}`, {})
        .then(res => res.json()) // parse response as JSON (can be res.text() for plain response)
        .then(response => {
          const container = document.getElementById('image-results')
          const slideShow = automateSlideShow(response)
          container.appendChild(slideShow)
          console.log(response)
        })
        .catch(err => {
          debugger
          console.log(err)
          alert("sorry, there are no results for your search")
        });
    }

    function automateSlideShow(slides) {
      slides.forEach(slide => {
        const slideEl = newElement('img')
        slideEl.setAttribute('class', 'slide')
        slideEl.setAttribute('src', )
      })

      let slideIndex = 0;
      carousel();

      function carousel() {
        let i;
        const slideImages = document.getElementsByClassName("slide");
        for (i = 0; i < slideImages.length; i++) {
          slideImages[i].style.display = "none";
        }
        slideIndex++;
        if (slideIndex > slideImages.length) {slideIndex = 1}
        slideImages[slideIndex-1].style.display = "block";
        setTimeout(carousel, 1000); // Change image every 1 second
      }
    }

    function newElement(tagName) {
      return document.createElement(tagName)
    }

    function buildControls(date) {
      const div = newElement('div');
      const prevBtn = newElement('span');
      const nextBtn = newElement('span');

      prevBtn.innerHTML = '&larr;';
      prevBtn.className = 'calendar-control';
      prevBtn.setAttribute('data-calendar-control', 'prev');

      nextBtn.innerHTML = '&rarr;';
      nextBtn.className = 'calendar-control';
      nextBtn.setAttribute('data-calendar-control', 'next');

      div.className = 'calendar-controls';

      div.appendChild(prevBtn);
      div.appendChild(nextBtn);

      removeEventListener(document, 'click', calendarControlClick);
      addEventListener(document, 'click', calendarControlClick);

      function calendarControlClick(evt) {
        evt.preventDefault();
        if (!evt.target.getAttribute('data-calendar-control')) {
          return
        }

        let target = evt.target;

        while (target.parentNode) {
          if (target.parentNode === container) {
            break;
          }

          target = target.parentNode;

          if (!target) {
            return
          }
        }

        const action = evt.target.getAttribute('data-calendar-control');

        switch (action) {
          case 'prev':
            date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
            title = buildTitle(date);
            break;
          case 'next':
            date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            title = buildTitle(date);
            break
        }

        calendar = buildTable(date.getFullYear(), date.getMonth());
        container.removeChild(container.firstChild);
        container.removeChild(container.firstChild);
        container.insertBefore(title, container.firstChild);
        container.insertBefore(calendar, container.lastChild)
      }

      return div
    }

    function addEventListener(target, event, handler) {
      if (document.addEventListener) {
        target.addEventListener(event, handler, false)
      } else {
        target.attachEvent('on' + event, handler)
      }
    }

    function removeEventListener(target, event, handler) {
      if (document.removeEventListener) {
        target.removeEventListener(event, handler, false)
      } else {
        target.detachEvent('on' + event, handler)
      }
    }
  }

  this.calendar = Calendar
}

let date = new Date().toISOString();
date = date.slice(0, date.indexOf('T'));

window.onload = function () {
  configureCalendar();
  this.calendar('#calendar', [{
    date: date,
    title: 'Today',
    color: '#252525'
  }])
};

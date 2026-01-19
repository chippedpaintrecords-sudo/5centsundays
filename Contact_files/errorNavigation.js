var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
(function(global, factory) {
  if (window.FORM_MODE === 'cardform') return;
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
      ? define(factory)
      : ((global = global || self), (global.ErrorNavigation = factory()));
})(this, function() { 'use strict';
  var state = {
    section: null,
    current: -1,
    errors: [],
    scrollToBottomOnClose: true,
  };
 
  function getMessage() {
    if (state.errors.length <= 0) {
      return JotForm.texts.doneMessage;
    }

    var msg="";
    if (state.errors.length === 1) {
      msg = JotForm.texts.oneError;
    }
    else{
      msg = JotForm.texts.multipleError;
    }

    msg = msg.replace('{count}', '<strong>' + state.errors.length + '</strong>');
    return msg;
  }

  function createNavigation(section) {
    var container = document.createElement('div');
    container.classList.add('error-navigation-container');
    container.style.display = 'none';
    container.setAttribute('aria-hidden', 'true');

    var inner = document.createElement('div');
    inner.classList.add('error-navigation-inner');
    container.appendChild(inner);

    var message = document.createElement('span');
    message.classList.add('error-navigation-message');
    message.setAttribute("role", "alert");
    message.setAttribute("aria-live", "polite");
    inner.appendChild(message);

    var nextButton = document.createElement('button');
    nextButton.classList.add('error-navigation-next-button');
    nextButton.type = 'button';
    nextButton.innerText = JotForm.texts.seeErrorsButton;
    nextButton.addEventListener('click', focusToNextError);
    inner.appendChild(nextButton);

    var doneButton = document.createElement('button');
    doneButton.classList.add('error-navigation-done-button');
    doneButton.type = 'button';
    doneButton.innerText = JotForm.texts.doneButton;
    doneButton.style.display = 'none';
    doneButton.addEventListener('click', close);
    inner.appendChild(doneButton);

    section.appendChild(container);
    return container;
  }

  function destroyNavigation(section) {
    var nav = section.querySelector('.error-navigation-container');
    if (nav) {
      nav.remove();
    }
  }

  function scrollAndFocus(nextCurrent, line, field, nextButton) {
    state.current = nextCurrent;
    line.scrollIntoView({ behavior: 'smooth', block: 'center' });
    field.focus({ preventScroll: true }); 
    nextButton.disabled = false;
  }

  function focusToNextError() {
    var nextButton = document.querySelector('.error-navigation-next-button');
    nextButton.disabled = true;
    var nextCurrent = (state.current + 1) % state.errors.length;
    var erroredLine = state.errors[nextCurrent];
    if (!erroredLine) {
      return;
    }
    var erroredField = erroredLine.querySelector('.form-validation-error');
    if (!erroredField) {
      return;
    }

    // The closed section collapse should be visible
    var parent = erroredLine.parentNode;
    var sectionCollapse = (parent && parent.hasClassName('form-section-closed')) ? parent.querySelector('li[data-type="control_collapse"] .form-collapse-table') : null;
    if (JotForm.doubleValidationFlag()) {
      var sections = document.querySelectorAll('ul.form-section:not([id^="section_"])');
      if (sections.length > 1) {
        var pagesIndex = parent.pagesIndex;
        if (pagesIndex === undefined && parent.parentNode) {
          pagesIndex = parent.parentNode.pagesIndex;
        }
        JotForm.jumpToPage(pagesIndex, true);
      }
    }
    if (sectionCollapse) {
      sectionCollapse.click();
      var collapseInterval = setInterval(function() {
        if (!parent.hasClassName('form-section-closed') || document.activeElement === erroredField) {
          clearInterval(collapseInterval);
        }
        scrollAndFocus(nextCurrent, erroredLine, erroredField, nextButton);  
      }, 500);
    } else {
      scrollAndFocus(nextCurrent, erroredLine, erroredField, nextButton);
    }
  }

  function close() {
    if (state.scrollToBottomOnClose) {
      window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: 'smooth' });
    }

    var bottomInterval = setInterval(function() {
      if (!state.scrollToBottomOnClose || (window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        clearInterval(bottomInterval);
        var errCont = state.section.querySelector('.error-navigation-container');
        if (errCont) {
            errCont.classList.add('fading-out');
        }
        setTimeout(function(){
          destroyNavigation(state.section);
        }, 210);
      }
    }, 100);
  }

  return {
    disableScrollToBottom: function disableScrollToBottom() {
      state.scrollToBottomOnClose = false;
    },
    update: function update(section, render) {
      if (!section) {
        var sections = document.querySelectorAll('.form-section.page-section');
        if (sections.length <= 0) {
          return;
        }
        section = sections[(sections.length - 1)];
      }
      if (JotForm.doubleValidationFlag()) {
        state.section = document.querySelector('.form-all');
      } else {
        state.section = section;
      }

      var invalidFields = state.section.querySelectorAll('.form-line.form-line-error');

      if (invalidFields.length <= 0 && state.errors.length <= 0) {
        destroyNavigation(state.section);
        return;
      }

      state.errors = invalidFields;

      var nav = state.section.querySelector('.error-navigation-container');
      if (!nav) {
        if (!render) {
          return;
        }
        nav = createNavigation(state.section);
      }

      if (state.errors.length > 0) {
        nav.querySelector('.error-navigation-next-button').style.display = 'block';
        nav.querySelector('.error-navigation-done-button').style.display = 'none';
        nav.classList.remove('is-success');
      } else {
        nav.classList.add('is-success');
        nav.querySelector('.error-navigation-next-button').style.display = 'none';
        nav.querySelector('.error-navigation-done-button').style.display = 'block';
      }

      nav.querySelector('.error-navigation-message').innerHTML = getMessage();

      // show navigation
      nav.style.display = null;
      nav.setAttribute('aria-hidden', 'false');
      nav.classList.remove('fading-out');
    },
  };
});

}
/*
     FILE ARCHIVED ON 06:56:43 Apr 22, 2024 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 23:04:51 Jan 14, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.614
  exclusion.robots: 0.019
  exclusion.robots.policy: 0.008
  esindex: 0.009
  cdx.remote: 18.007
  LoadShardBlock: 159.665 (3)
  PetaboxLoader3.datanode: 220.083 (5)
  load_resource: 391.564 (2)
  PetaboxLoader3.resolve: 289.566 (2)
*/
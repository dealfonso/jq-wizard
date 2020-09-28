/**
 * jq-wizard - Self managed Bootstrap Wizard
 * https://github.com/dealfonso/jq-wizard
 *
 * Copyright (C) GRyCAP - I3M - UPV 
 * Developed by Carlos A. caralla@upv.es
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * -------------
 * 
 * Class that creates and manages a wizard made in bootstrap
 * 
 * The structure for the wizard is the next:
 * 
 * <div id='mywizard'>
 *  <div class='wizard-tab' stepname='step1'>
 *  </div>
 *  <div class='wizard-tab' stepname='step2'>
 *  </div>
 *  <div class='wizard-tab' stepname='step3'>
 *  </div>
 *  <div>
 *      <div class='step'></div>
 *      <div class='step'></div>
 *      <div class='step'></div>
 *  </div>
 *  <div>
 *      <button class='btn-prev'></button>
 *      <button class='btn-next'></button>
 *      <button class='btn-end'></button>
 *  </div>
 * </div>
 * 
 * <script>
 * options = {
 *  onnext: function(stepname, steppos) { return true },     // Called *before* passing to the next step (will go to next in case that returns true)
 *  onprev: function(stepname, steppos) { return true },     // Called *before* passing to the prev step (will go to next in case that returns true)
 *  onstep: function(stepname, steppos) { return true },     // Called when showing a step (if arrived clicking on "next" button, will be called *AFTER* onnext or onprev)
 *  onend: function(stepname, steppos) { return true },      // Called *before* accepting the end click (will execute the default behaviour of the command in case that returns true)
 *  onbegin: function() { return true },                     // Called whenever the script "begin" is called
 *  hidefnc: function($obj) { $obj.hide() },                 // Called when an object has to be hidden (e.g. the wizard-tab div or btn-prev button (if autohideprev is true)); maybe you want to set a custom class, instead; receives the jquery obj as parameter
 *  showfnc: function($obj) { $obj.show() },                 // Called when an object has to be shown (e.g. the wizard-tab div or btn-prev button (if autohideprev is true)); maybe you want to set a custom class, instead; receives the jquery obj as parameter
 *  stepobject: '.step',                                     // Selector to select the step indicators
 *  stepactiveclass: 'active',                               // Class used to mark those steps that have already been done
 *  tabselector: 'div.wizard-tab',                           // Selector for each tab
 *  stepnameattr: 'stepname',                                // Attribute used to provide the name of the step
 *  autohidenext: true,     // Hides "next" button if disabled
 *  autohideprev: false,    // Hides "prev" button if disabled
 *  autohideend: true,      // Hides "end" button if disabled
 *  autofocus: true,        // Automatically sets the focus on the first input INSIDE the tab, when shown
 * }
 * $('#mywizard').wizard(options)
 * </script>
 * 
 * TODO: by now, the step count is fixed (i.e. cannot add or delete tabs dinamically). 
 */


class Wizard {
    constructor(element, settings) {
        // Associate to the element
        this._element = element;
        element._wizard = this;

        // Set the configuration values
        this._autofocus = settings.autofocus;
        this._autohideend = settings.autohideend;
        this._autohidenext = settings.autohidenext;
        this._autohideprev = settings.autohideprev;
        this._onstep = settings.onstep;
        this._onnext = settings.onnext;
        this._onprev = settings.onprev;
        this._onend = settings.onend;
        this._onbegin = settings.onbegin;
        this._hidefnc = settings.hidefnc;
        this._showfnc = settings.showfnc;
        this._stepobject = settings.stepobject;
        this._stepactiveclass = settings.stepactiveclass;
        this._tabclass = settings.tabclass;
        this._tabselector = settings.tabselector;
        this._stepnameattr = settings.stepnameattr;

        // Initialize the wizard
        this._current = -1;
        if (this.stepcount() > 0) {
            this.begin();
            this._attachEvents();
        } else {
            console.warn('no steps detected for the wizard')
            this._updateInterface();
        }

    }

    current() {
        return this._current;
    }

    currentstepname() {
        let $currenttab = this._getTab$();
        return $currenttab.attr(this._stepnameattr);
    }

    stepcount() {
        return $(this._element).find(this._tabselector).length
    }

    next(skipvalidation = false) {
        // If possible to next
        if (this._current < this.stepcount() - 1) {
            let $currenttab = this._getTab$();
            let stepname = $currenttab.attr(this._stepnameattr);
            let gonext = true;
            if (! skipvalidation)
                gonext = this._onnext(stepname, this._current);
            if (gonext)
                this._showStep(this._current + 1);
        }
    }

    prev(skipvalidation = false) {
        // If possible to next
        if (this._current > 0) {
            let $currenttab = this._getTab$();
            let stepname = $currenttab.attr(this._stepnameattr);
            let goprev = true;
            if (! skipvalidation)
                goprev = this._onprev(stepname, this._current);
            if (goprev)
                this._showStep(this._current - 1);
        }
    }

    end(skipvalidation = false) {
        if (this._current == this.stepcount() - 1) {
            let $currenttab = this._getTab$();
            let stepname = $currenttab.attr(this._stepnameattr);
            let goend = true;
            if (! skipvalidation)
                goend = this._onend(stepname, this._current);
            return goend;
        }
        return false;
    }

    refresh() {
        this._showStep();
    }

    begin() {
        this._onbegin();
        this._showStep(0);
    }

    _getTab$(n = null) {

        // Return the current tab
        if (n === null) n = this._current;

        // Fail if the step is out of bounds
        if ((n < 0) || (n > this.stepcount())) return null;

        // Find the object
        let $e = $(this._element);
        let $tabs = $e.find(this._tabselector);
        return $($tabs[n]);
    }

    _attachEvents() {
        let $e = $(this._element);
        let $btn_prev = $e.find('.btn-prev');
        let $btn_next = $e.find('.btn-next');
        let $btn_end = $e.find('.btn-end');

        $btn_next.on('click', function(e) {
            e.preventDefault();
            this.next();
        }.bind(this));

        $btn_prev.on('click', function(e) {
            e.preventDefault();
            this.prev();
        }.bind(this));

        $btn_end.on('click', function(e) {
            if (! this.end())
                e.preventDefault();
        }.bind(this));
    }

    _updateInterface() {
        let stepcount = this.stepcount();
        let $e = $(this._element);
        let n = this._current;

        // Update the step (if exist)
        let $dots = $e.find(this._stepobject);
        $dots.removeClass(this._stepactiveclass);

        for (let i = 0; i <= n; i++)
            $($dots[i]).addClass(this._stepactiveclass);

        // Update the state of the buttons
        let $btn_prev = $e.find('.btn-prev');
        let $btn_next = $e.find('.btn-next');
        let $btn_end = $e.find('.btn-end');

        $btn_prev.prop('disabled', (n <= 0));
        $btn_next.prop('disabled', (n < 0) || (n > (stepcount - 2)));
        $btn_end.prop('disabled', (n < 0) || (n < (stepcount - 1)));

        if (this._autohideprev)
            if (n <= 0)
                this._hidefnc($btn_prev);
            else
                this._showfnc($btn_prev);

        if (this._autohidenext)
            if ((n < 0) || (n > stepcount - 2))
                this._hidefnc($btn_next);
            else
                this._showfnc($btn_next);

        if (this._autohideend)
            if ((n < 0) || (n < stepcount - 1))
                this._hidefnc($btn_end);
            else
                this._showfnc($btn_end);
    }

    _showStep(n) {
        let $e = $(this._element);
        let $tabs = $e.find(this._tabselector);

        // Hide all tabs
        this._hidefnc($tabs);

        let stepcount = this.stepcount();

        // Show the one that we want
        if ((n >= 0) && (n < stepcount)) {

            let $currentstep = this._getTab$(n);    // let $currentstep = $($tabs[n]);
            this._showfnc($currentstep);

            // Autofocus on the first input
            if (this._autofocus)
                $($currentstep.find('input')[0]).focus();

            // End
            this._current = n;
            this._updateInterface();
            this._onstep($currentstep.attr(this._stepnameattr), this._current);
            return true;
        } else
            return false;
    }
}

(function ($) {
    $.fn.wizard = function(options, argument) {
        const defaults = {
            onnext: function (stepname, steppos) { return true },
            onprev: function (stepname, steppos) { return true },
            onend: function (stepname, steppos) { return true },
            onstep: function (stepname, steppos) { return true },
            onbegin: function () {}, 
            hidefnc: function ($obj) { $obj.hide() },
            showfnc: function ($obj) { $obj.show() },
            stepobject: '.step',
            stepactiveclass: 'active',
            tabselector: 'div.wizard-tab',
            stepnameattr: 'stepname',
            autohidenext: true,
            autohideprev: false,
            autohideend: true,
            autofocus: true,
        }

        var settings = $.extend(defaults, options);

        this.each(function() {

            let data = this._wizard;
            if (!data)
                data = new Wizard(this, settings);
            this._wizard = data;

            if (typeof options === 'string') {
                if (typeof data[options] === 'undefined') {
                    throw new TypeError(`No method named "${options}"`)
                }
                data[options](argument)
            } 
        })

        // To chain operations
        return this;
    }
}(jQuery));
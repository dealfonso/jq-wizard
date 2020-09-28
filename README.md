# jQuery Wizard (jq-wizard)

This is a component to create seld-managed wizards, using jQuery.

It is easy to use in your projects, as you just need to define each of your steps inside a div with a class, add the "next" and "previous" buttons, and call the `wizard()` function:
```html
<div id='mywizard'>
    <div class='wizard-tab' stepname='step1'>
        <h1>This is the first step</h1>
    </div>
    <div class='wizard-tab' stepname='step2'>
        <h1>This is the second step</h1>
    </div>
    <div class='wizard-tab' stepname='step3'>
        <h1>This is the last step</h1>
    </div>
    <div>
        <button class='btn btn-primary btn-prev'>Prev</button>
        <button class='btn btn-primary btn-next'>Next</button>
    </div>
</div>      
<script>
$(function() {
    $('#mywizard').wizard();
})
</script>
```

## Examples

You have several examples in this folder (some of them use bootstrap):
- *simple.html* that contains a div-based example ([See it in action at codepen](https://codepen.io/dealfonso/pen/PoNgjKW)).
- *modal.html* that contains a simple wizard inside a bootstrap modal ([See it in action at codepen](https://codepen.io/dealfonso/pen/XWdQgzO)).
- *modalform.html* that contains a full wizard example with tab validation and other features, inside a form that can be submitted to your server ([See it in action at codepen](https://codepen.io/dealfonso/pen/eYZoRVQ)).

## Using

You need to include `jq-wizard.js` either from your cloned repo, or from a CDN, after jQuery. e.g.:

```html
    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/dealfonso/jq-wizard@1.0beta/jq-wizard.js"></script>
```

## Customization

jq-wizard is highly customizable. You just need to pass an object to the "wizard" function, that overrides the default values:

```javascript
    $('#mywizard').wizard({
        onnext: function(stepname, steppos) { return true },
        ...
    })
```

The meaning of the values and default values are the next:

   - *onnext*: Function called *before* passing to the next step (will go to next in case that returns true).
        - Default: `function(stepname, steppos) { return true }`
   - *onprev*: Function called *before* passing to the prev step (will go to next in case that returns true).
        - Default: `function(stepname, steppos) { return true }`
   - *onstep*: Function called when showing a step (if arrived clicking on "next" button, will be called *AFTER* onnext or onprev)
        - Default: `function(stepname, steppos) { return true }`
   - *onend*: Function called *before* accepting the end click (will execute the default behaviour of the command in case that returns true).
        - Default: `function(stepname, steppos) { return true }`
   - *onbegin*: Function called whenever the script "begin" is called.
        - Default: `function() { return true }`
   - *hidefnc*: Method called when an object has to be hidden (e.g. the wizard-tab div or btn-prev button (if autohideprev is true)); maybe you want to set a custom class, instead.
        - Default: `function($obj) { $obj.hide() }`
   - *showfnc*: Method called when an object has to be shown (e.g. the wizard-tab div or btn-prev button (if autohideprev is true)); maybe you want to set a custom class, instead.
        - Default: `function($obj) { $obj.show() }`
   - *stepobject*: Selector to select the step indicators
        - Default: `.step`
   - *stepactiveclass*: Class used to mark those steps that have already been done
        - Default: `active`
   - *tabselector*: Selector for each tab.
        - Default: `div.wizard-tab`
   - *stepnameattr*: Attribute used to provide the name of the step
        - Default: `stepname`
   - *autohidenext*: If true, hides "next" button if disabled
        - Default: `true`
   - *autohideprev*: If true, hides "prev" button if disabled
        - Default: `false`
   - *autohideend*: If true, hides "end" button if disabled
        - Default: `true`
   - *autofocus*: If true, automatically sets the focus on the first input INSIDE the tab, when shown.
        - Default: `true`

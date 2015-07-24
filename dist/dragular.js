(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ctibor/projects/adminmode/gulp/node_modules/dragular/dragular.js":[function(require,module,exports){
/* global angular */
'use strict';

/**
 * dragular Module by Luckylooke https://github.com/luckylooke
 *
 * Angular version of dragula https://github.com/bevacqua/dragula
 */

angular.module('dragularModule', []).factory('dragularService', function dragula() {

  var containersNameSpaced = {}, // name-spaced containers
    containersNameSpacedModel = {}, // name-spaced containers models
      _mirror; // mirror image

  return function(initialContainers, options) {

    if (arguments.length === 1 && !Array.isArray(initialContainers) && !angular.isElement(initialContainers) && !initialContainers[0]) {
      // then containers are not provided, only options
      options = initialContainers;
      initialContainers = [];
    }

    var body = document.body,
      documentElement = document.documentElement,
      _source, // source container
      _item, // item being dragged
      _sourceModel, // source container model
      _itemModel, // item-model being dragged
      _offsetX, // reference x
      _offsetY, // reference y
      _offsetXr, // reference x right for boundingBox feature
      _offsetYb, // reference y bottom for boundingBox feature
      _clientX, // cache client x, init at grab, update at drag
      _clientY, // cache client y, init at grab, update at drag
      _mirrorWidth, // mirror width for boundingBox feature
      _mirrorHeight, // mirror height for boundingBox feature
      _initialSibling, // reference sibling when grabbed
      _currentSibling, // reference sibling now
      _initialIndex, // reference model index when grabbed
      _currentIndex, // reference model index now
      _lastOverElem, // last element behind the cursor (dragOverClasses feature)
      _lastOverClass, // last overClass used (dragOverClasses feature)
      _copy, // item used for copying
      _copyModel, // item-model used for copying
      _containers = {}, // containers managed by the drake
      _containersModel = {}, // containers model
      _renderTimer, // timer for setTimeout renderMirrorImage
      _isContainer, // internal isContainer
      _dropContainer, // droppable container under drag item
      defaultClasses = {
        mirror: 'gu-mirror',
        hide: 'gu-hide',
        unselectable: 'gu-unselectable',
        transit: 'gu-transit',
        overActive: 'gu-over-active',
        overAccepts: 'gu-over-accept',
        overDeclines: 'gu-over-decline'
      },
      o = { // options
        classes: defaultClasses,
        containers: false,
        moves: always,
        accepts: always,
        isContainer: never,
        copy: false,
        delay: false,
        invalid: invalidTarget,
        revertOnSpill: false,
        removeOnSpill: false,
        dragOverClasses: false,
        lockX: false,
        lockY: false,
        boundingBox: false,
        containersModel: false
      };

    if (!isElement(o.boundingBox)) {
      o.boundingBox = null;
    }

    if (options && options.classes) {
      angular.extend(defaultClasses, options.classes);
      angular.extend(options.classes, defaultClasses);
    }

    angular.extend(o, options);

    if (o.delay === true) {
      o.delay = 300;
    }

    initialContainers = o.containers || (initialContainers ? makeArray(initialContainers) : []);
    if(o.containers){
      initialContainers = makeArray(initialContainers);
    }
    if(o.containersModel){
      o.containersModel = makeArray(o.containersModel);
    }

    initialContainers.forEach(function addMouseDown (container) {
      regEvent(container, 'on', 'mousedown', grab);
    });

    if (o.nameSpace) {
       if (!Array.isArray(o.nameSpace)) {
          o.nameSpace = [o.nameSpace];
       }
       function proceedNameSpaces(_containers, containersNameSpaced, nameSpace, initialContainers){
        if (!containersNameSpaced[nameSpace]) {
          containersNameSpaced[nameSpace] = [];
        }
        Array.prototype.push.apply(containersNameSpaced[nameSpace], initialContainers);
        _containers[nameSpace] = containersNameSpaced[nameSpace];
       }
      o.nameSpace.forEach(function eachNameSpace (nameSpace) {
        proceedNameSpaces(_containers, containersNameSpaced, nameSpace, initialContainers);
        if(o.containersModel){
          proceedNameSpaces(_containersModel, containersNameSpacedModel, nameSpace, o.containersModel)
        }
      });
      _isContainer = isContainerNameSpaced;
      _isContainerModel = isContainerNameSpacedModel;
    }else{
      _containers = initialContainers;
      _isContainer = isContainer;
      if(o.containersModel){
          _containersModel = o.containersModel;
        }
    }

    events();

    var api = {
      addContainer: manipulateContainers('add'),
      removeContainer: manipulateContainers('remove'),
      containers: _containers,
      start: start,
      end: end,
      cancel: cancel,
      remove: remove,
      destroy: destroy,
      dragging: false
    };

    return api;


    function makeArray(all) {
      if (Array.isArray(all)) {
        return all;
      }
      if (all.length) { // is array-like
        var iAll = all.length,
          newArray = [];
        while (iAll) {
          iAll--;
          newArray.push(all[iAll]);
        }
        return newArray;
      } else { // is one element
        return [all];
      }
    }

    function manipulateContainers(op) {
      return function addOrRemove(all) {
        var changes = Array.isArray(all) ? all : makeArray(all);
        changes.forEach(function forEachContainer(container) {
          if(o.nameSpace){
            angular.forEach(o.nameSpace, function addRemoveNamespaced (containers, nameSpace) {
              if (op === 'add') {
                _containers[nameSpace].push(container);
                console.warn && console.warn('drake.addContainer is deprecated. please access drake.containers directly, instead');
              } else {
                _containers[nameSpace].splice(_containers.indexOf(container), 1);
                console.warn && console.warn('drake.removeContainer is deprecated. please access drake.containers directly, instead');
              }
            });
          }else{
            if (op === 'add') {
              _containers.push(container);
              console.warn && console.warn('drake.addContainer is deprecated. please access drake.containers directly, instead');
            } else {
              _containers.splice(_containers.indexOf(container), 1);
              console.warn && console.warn('drake.removeContainer is deprecated. please access drake.containers directly, instead');
            }
          }
        });
      };
    }

    function isContainer(el) {
      return api.containers.indexOf(el) !== -1 || o.isContainer(el);
    }

    function isContainerNameSpaced(el) {
      var nameSpace;
      for (nameSpace in api.containers) {
          if (api.containers.hasOwnProperty(nameSpace) && api.containers[nameSpace].indexOf(el) !== -1) {
              return true;
          }
      }
      if(o.isContainer(el)){
        return true;
      }
      return false;
    }

    function events(rem) {
      var op = rem ? 'off' : 'on';
      regEvent(documentElement, op, 'mouseup', release);
    }

    function destroy() {
      events(true);
      api.removeContainer(_containers);
      release({});
    }

    function grab(e) {
      e = e || window.event;
      var item = e.target;

      if ((e.which !== 0 && e.which !== 1) || e.metaKey || e.ctrlKey) {
        return; // we only care about honest-to-god left clicks and touch events
      }
      if (start(item) !== true) {
        return;
      }

      if (!o.direction) {
        var parent = item.parentElement,
          parentHeight = parent.offsetHeight,
          parentWidth = parent.offsetWidth,
          childHeight = item.clientHeight,
          childWidth = item.clientWidth;
        o.direction = parentHeight / childHeight < parentWidth / childWidth ? 'horizontal' : 'vertical';
      }

      var offset = getOffset(_item);
      _offsetX = getCoord('pageX', e) - offset.left;
      _offsetY = getCoord('pageY', e) - offset.top;
      _clientX = getCoord('clientX', e);
      _clientY = getCoord('clientY', e);
      if (o.boundingBox) {
        _offsetXr = getCoord('pageX', e) - offset.right;
        _offsetYb = getCoord('pageY', e) - offset.bottom;
      }

      if (typeof o.delay === 'number') {
        _renderTimer = setTimeout(function() {
          renderMirrorAndDrag(e);
        }, o.delay);
      } else {
        renderMirrorAndDrag(e);
      }

      e.preventDefault();
    }

    function renderMirrorAndDrag(e) {
      renderMirrorImage();
      // initial position
      _mirror.style.left = _clientX - _offsetX + 'px';
      _mirror.style.top = _clientY - _offsetY + 'px';

      drag(e);
    }


    function start(item) {
      var handle = item;

      if (api.dragging && _mirror) {
        return false;
      }

      if (_isContainer(item)) {
        return false; // don't drag container itself
      }
      while (!_isContainer(item.parentElement)) {
        if (o.invalid(item, handle)) {
          return false;
        }
        item = item.parentElement; // drag target should be a top element
        if (!item) {
          return;
        }

      }
      if (o.invalid(item, handle)) {
        return false;
      }

      var container = item.parentElement,
        movable = o.moves(item, container, handle);
      if (!movable) {
        return false;
      }

      end();

      if (o.containersModel){
        var containerIndex = initialContainers.indexOf(container),
          itemIndex = Array.prototype.indexOf.call(angular.element(item.parentElement).children(), item);

        _initialIndex = _currentIndex = itemIndex;
        _sourceModel = o.containersModel[containerIndex];
        _itemModel = _sourceModel[itemIndex];
        if(o.copy){
          _copyModel = angular.copy(_itemModel);
        }
      }

      if (o.copy) {
        _copy = item.cloneNode(true);
        addClass(_copy, o.classes.transit);
        if (o.scope) {
          o.scope.$emit('cloned', _copy, item);
        }
      } else {
        addClass(item, o.classes.transit);
      }

      _source = container;
      _item = item;
      _initialSibling = _currentSibling = nextEl(item);

      api.dragging = true;
      if (o.scope) {
        o.scope.$emit('drag', _item, _source);
      }

      return true;
    }

    function invalidTarget(el) {
      return el.tagName === 'A' || el.tagName === 'BUTTON';
    }

    function end() {
      if (!api.dragging) {
        return;
      }
      var item = _copy || _item;
      drop(item, item.parentElement);
    }

    function release(e) {
      if (!api.dragging) {
        return;
      }
      e = e || window.event;

      _clientX = getCoord('clientX', e);
      _clientY = getCoord('clientY', e);

      var item = _copy || _item,
        elementBehindCursor = getElementBehindPoint(_mirror, _clientX, _clientY),
        dropTarget = findDropTarget(elementBehindCursor, _clientX, _clientY);
      if (dropTarget && (o.copy === false || dropTarget !== _source)) {
        drop(item, dropTarget);
      } else if (o.removeOnSpill) {
        remove();
      } else {
        cancel();
      }
      if (o.dragOverClasses && _lastOverElem) {
        rmClass(_lastOverElem, _lastOverClass);
        _dropContainer = null;
        _lastOverElem = null;
      }
    }

    function drop(item, target) {
      if (o.scope && isInitialPlacement(target)) {
        o.scope.$emit('cancel', item, _source);
      } else if (o.scope) {
        o.scope.$emit('drop', item, target, _source);
      }
      cleanup();
    }

    function remove() {
      if (!api.dragging) {
        return;
      }
      var item = _copy || _item,
        parent = item.parentElement;
      if (parent) {
        parent.removeChild(item);
      }
      if(o.containersModel && !o.copy){
        _sourceModel.splice(_sourceModel.indexOf(_itemModel),1);
      }
      if (o.scope) {
        o.scope.$emit(o.copy ? 'cancel' : 'remove', item, parent);
      }
      cleanup();
    }

    function cancel(revert) {
      if (!api.dragging) {
        return;
      }
      var reverts = arguments.length > 0 ? revert : o.revertOnSpill,
        item = _copy || _item,
        parent = item.parentElement;
      if (parent === _source && o.copy) {
        parent.removeChild(_copy);
      }
      var initial = isInitialPlacement(parent);
      if (initial === false && o.copy === false && reverts) {
        _source.insertBefore(item, _initialSibling);
        if(o.containersModel){
          _sourceModel.splice(_initialIndex, 1, _itemModel);
        }
      }
      if (o.scope && (initial || reverts)) {
        o.scope.$emit('cancel', item, _source);
      } else if (o.scope) {
        o.scope.$emit('drop', item, parent, _source);
      }
      cleanup();
    }

    function cleanup() {
      var item = _copy || _item;
      removeMirrorImage();
      if (item) {
        rmClass(item, o.classes.transit);
      }
      if (_renderTimer) {
        clearTimeout(_renderTimer);
      }
      _source = _item = _copy = _initialSibling = _currentSibling = _sourceModel = _itemModel = _copyModel = _initialIndex = _currentIndex = _renderTimer = null;

      api.dragging = false;
      if (o.scope) {
        o.scope.$emit('dragend', item);
      }
    }

    function isInitialPlacement(target, s) {
      var sibling;
      if (s !== void 0) {
        sibling = s;
      } else if (_mirror) {
        sibling = _currentSibling;
      } else {
        sibling = nextEl(_item || _copy);
      }
      return target === _source && sibling === _initialSibling;
    }

    function findDropTarget(elementBehindCursor, clientX, clientY) {
      var target = elementBehindCursor;
      while (target && !accepted()) {
        target = target.parentElement;
      }
      return target;

      function accepted() {
        var accepts = false;

        if (_isContainer(target)) { // is droppable?
          var immediate = getImmediateChild(target, elementBehindCursor),
            reference = getReference(target, immediate, clientX, clientY),
            initial = isInitialPlacement(target, reference);
          accepts = initial ? true : o.accepts(_item, target, _source, reference, _itemModel, _sourceModel);
        }

        if (o.dragOverClasses &&
          hasClass(target, o.classes.overActive) &&
          target !== _lastOverElem) {

          if (_lastOverElem) {
            rmClass(_lastOverElem, _lastOverClass);
          }

          _lastOverClass = accepts ? o.classes.overAccepts : o.classes.overDeclines;
          addClass(target, _lastOverClass);
          _dropContainer = accepts ? target : null;
          _lastOverElem = target;
        }
        return accepts;
      }
    }

    function findDropTargetModel(target) {
      var targetModel = false;
      if(o.nameSpace){
        o.nameSpace.forEach(function findDropTargetModelInNameSpace (nameSpace) {
          if(!targetModel && _containersModel[nameSpace].indexOf(target) !== -1){
            targetModel = _containersModel[nameSpace][_containersModel[nameSpace].indexOf(target)];
          }
        });
      }else{
        if(_containersModel.indexOf(target) !== -1){
            targetModel = _containersModel[_containersModel.indexOf(target)];
          }
      }

      if(!targetModel && o.isContainerModel){
        var scope = angular.element(target).scope() || angular.element(target).isolateScope();
        if(scope){
          targetModel = scope[o.isContainerModel];
        }
      }
      return targetModel;
    }

    function drag(e) {
      if (!_mirror) {
        return;
      }
      e = e || window.event;

      _clientX = getCoord('clientX', e);
      _clientY = getCoord('clientY', e);

      var x = _clientX - _offsetX,
        y = _clientY - _offsetY,
        pageX,
        pageY,
        offsetBox;

      if (o.boundingBox) {
        pageX = getCoord('pageX', e);
        pageY = getCoord('pageY', e);
        offsetBox = getOffset(o.boundingBox);
      }

      if (!o.lockY) {
        if (!o.boundingBox || (pageX > offsetBox.left + _offsetX && pageX < offsetBox.right + _offsetXr)) {
          _mirror.style.left = x + 'px';
        } else if (o.boundingBox) { // in case user scroll
          if (pageX < offsetBox.left + _offsetX) {
            _mirror.style.left = _clientX - (pageX - offsetBox.left) + 'px';
          } else {
            _mirror.style.left = _clientX - _mirrorWidth - (pageX - offsetBox.right) + 'px';
          }
        }
      }
      if (!o.lockX) {
        if (!o.boundingBox || (pageY > offsetBox.top + _offsetY && pageY < offsetBox.bottom + _offsetYb)) {
          _mirror.style.top = y + 'px';
        } else if (o.boundingBox) { // in case user scroll
          if (pageY < offsetBox.top + _offsetY) {
            _mirror.style.top = _clientY - (pageY - offsetBox.top) + 'px';
          } else {
            _mirror.style.top = _clientY - _mirrorHeight - (pageY - offsetBox.bottom) + 'px';
          }
        }
      }

      var item = _copy || _item,
        elementBehindCursor = getElementBehindPoint(_mirror, _clientX, _clientY),
        dropTarget = findDropTarget(elementBehindCursor, _clientX, _clientY);

      if (dropTarget === _source && o.copy) {
        return;
      }

      var reference,
        immediate = getImmediateChild(dropTarget, elementBehindCursor);

      if(o.containersModel){
        var itemModel = _copyModel || _itemModel,
          targetModel = findDropTargetModel(target),
          referenceIndex = targetModel ? targetModel.indexOf(_itemModel) : 0;
      }

      if (immediate !== null) {
        reference = getReference(dropTarget, immediate, _clientX, _clientY);
      } else if (o.revertOnSpill === true && !o.copy) {
        reference = _initialSibling;
        dropTarget = _source;
        if(o.containersModel){
          referenceIndex = _initialIndex;
          targetModel = _sourceModel;
        }
      } else {
        if ((o.copy || o.removeOnSpill === true) && item.parentElement !== null) {
          item.parentElement.removeChild(item);
          if(o.containersModel){
            targetModel.splice(referenceIndex, 1);
          }
        }
        return;
      }
      if (reference === null || reference !== item && reference !== nextEl(item)) {
        _currentSibling = reference;
        dropTarget.insertBefore(item, reference);

        if(o.containersModel){
          _currentIndex = referenceIndex;
          targetModel.splice(referenceIndex, 1, _itemModel);
        }

        if (o.scope) {
          o.scope.$emit('shadow', item, dropTarget);
        }
      }
    }

    function scrollContainer(e){   
      _dropContainer.scrollTop += e.deltaY;
    }

    function renderMirrorImage() {
      if (_mirror) {
        return;
      }
      var rect = _item.getBoundingClientRect();
      _mirror = _item.cloneNode(true);
      _mirrorWidth = rect.width;
      _mirrorHeight = rect.height;
      _mirror.style.width = getRectWidth(rect) + 'px';
      _mirror.style.height = getRectHeight(rect) + 'px';
      rmClass(_mirror, o.classes.transit);
      addClass(_mirror, o.classes.mirror);
      body.appendChild(_mirror);
      regEvent(documentElement, 'on', 'mousemove', drag);
      addClass(body, o.classes.unselectable);
      regEvent(_mirror, 'on', 'wheel', scrollContainer);
      if (o.scope) {
        o.scope.$emit('cloned', _mirror, _item);
      }
    }

    function removeMirrorImage() {
      if (_mirror) {
        rmClass(body, o.classes.unselectable);
        regEvent(documentElement, 'off', 'mousemove', drag);
        regEvent(_mirror, 'off', 'wheel', scrollContainer);
        _mirror.parentElement.removeChild(_mirror);
        _mirror = null;
      }
    }

    function getImmediateChild(dropTarget, target) {
      var immediate = target;
      while (immediate !== dropTarget && immediate.parentElement !== dropTarget) {
        immediate = immediate.parentElement;
      }
      if (immediate === documentElement) {
        return null;
      }
      return immediate;
    }

    function getReference(dropTarget, target, x, y) {
      var horizontal = o.direction === 'horizontal';
      var reference = target !== dropTarget ? inside() : outside();
      return reference;

      function outside() { // slower, but able to figure out any position
        var len = dropTarget.children.length;
        var i;
        var el;
        var rect;
        for (i = 0; i < len; i++) {
          el = dropTarget.children[i];
          rect = el.getBoundingClientRect();
          if (horizontal && rect.left > x) {
            return el;
          }
          if (!horizontal && rect.top > y) {
            return el;
          }
        }
        return null;
      }

      function inside() { // faster, but only available if dropped inside a child element
        var rect = target.getBoundingClientRect();
        if (horizontal) {
          return resolve(x > rect.left + getRectWidth(rect) / 2);
        }
        return resolve(y > rect.top + getRectHeight(rect) / 2);
      }

      function resolve(after) {
        return after ? nextEl(target) : target;
      }
    }

    function getScroll(scrollProp, offsetProp) {
      if (typeof window[offsetProp] !== 'undefined') {
        return window[offsetProp];
      }
      if (documentElement.clientHeight) {
        return documentElement[scrollProp];
      }
      return body[scrollProp];
    }

    function getOffset(el) {
      var rect = el.getBoundingClientRect(),
        scrollTop = getScroll('scrollTop', 'pageYOffset'),
        scrollLeft = getScroll('scrollLeft', 'pageXOffset');
      return {
        left: rect.left + scrollLeft,
        right: rect.right + scrollLeft,
        top: rect.top + scrollTop,
        bottom: rect.bottom + scrollTop
      };
    }

    function getElementBehindPoint(point, x, y) {
      if (!x && !y) {
        return null;
      }
      var p = point || {},
        state = p.className,
        el;
      p.className += ' ' + o.classes.hide;
      el = document.elementFromPoint(x, y);
      p.className = state;
      return el;
    }
  };

  function regEvent(el, op, type, fn) {
    var touch = {
        mouseup: 'touchend',
        mousedown: 'touchstart',
        mousemove: 'touchmove'
      },
      $el = angular.element(el);

    if(type !== 'wheel'){$el[op](touch[type], fn)};
    $el[op](type, fn);
  }

  function never() {
    return false;
  }

  function always() {
    return true;
  }

  function nextEl(el) {
    return el.nextElementSibling || manually();

    function manually() {
      var sibling = el;
      do {
        sibling = sibling.nextSibling;
      } while (sibling && sibling.nodeType !== 1);
      return sibling;
    }
  }

  //Cannot use angular.isElement because we need to check plain dom element, no jQlite wrapped  
  function isElement(o) {
    return (
      typeof HTMLElement === 'object' ? o instanceof HTMLElement : //DOM2
      o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string'
    );
  }

  function addClass(el, className) {
    if (el.className.indexOf(' ' + className) === -1) {
      el.className += ' ' + className;
    }
  }

  function rmClass(el, className) {
    angular.element(el).removeClass(className);
  }

  function hasClass(el, className) {
    return (' ' + el.className + ' ').indexOf(' ' + className + ' ') > -1;
  }

  function getEventHost(e) {
    // on touchend event, we have to use `e.changedTouches`
    // see http://stackoverflow.com/questions/7192563/touchend-event-properties
    // see https://github.com/bevacqua/dragula/issues/34
    if (e.targetTouches && e.targetTouches.length) {
      return e.targetTouches[0];
    }
    if (e.changedTouches && e.changedTouches.length) {
      return e.changedTouches[0];
    }
    return e;
  }

  function getCoord(coord, e) {
    var host = getEventHost(e);
    var missMap = {
      pageX: 'clientX', // IE8
      pageY: 'clientY' // IE8
    };
    if (coord in missMap && !(coord in host) && missMap[coord] in host) {
      coord = missMap[coord];
    }
    return host[coord];
  }

  function getRectWidth(rect) {
    return rect.width || (rect.right - rect.left);
  }

  function getRectHeight(rect) {
    return rect.height || (rect.bottom - rect.top);
  }

}).directive('dragular', ['dragularService', function(dragularService) {
  return {
    restrict: 'A',
    link: function($scope, iElm, iAttrs) {
      dragularService(iElm[0], $scope[iAttrs.dragular || 'undefined'] || tryJson(iAttrs.dragular));

      function tryJson(json) {
        try {
          return JSON.parse(json);
        } catch (e) {
          console.log(e, 'Dragular: not valid JSON for options!', iElm);
          return undefined;
        }
      }
    }
  };
}]);

},{}]},{},["/home/ctibor/projects/adminmode/gulp/node_modules/dragular/dragular.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkcmFndWxhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZ2xvYmFsIGFuZ3VsYXIgKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBkcmFndWxhciBNb2R1bGUgYnkgTHVja3lsb29rZSBodHRwczovL2dpdGh1Yi5jb20vbHVja3lsb29rZVxuICpcbiAqIEFuZ3VsYXIgdmVyc2lvbiBvZiBkcmFndWxhIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoJ2RyYWd1bGFyTW9kdWxlJywgW10pLmZhY3RvcnkoJ2RyYWd1bGFyU2VydmljZScsIGZ1bmN0aW9uIGRyYWd1bGEoKSB7XG5cbiAgdmFyIGNvbnRhaW5lcnNOYW1lU3BhY2VkID0ge30sIC8vIG5hbWUtc3BhY2VkIGNvbnRhaW5lcnNcbiAgICBjb250YWluZXJzTmFtZVNwYWNlZE1vZGVsID0ge30sIC8vIG5hbWUtc3BhY2VkIGNvbnRhaW5lcnMgbW9kZWxzXG4gICAgICBfbWlycm9yOyAvLyBtaXJyb3IgaW1hZ2VcblxuICByZXR1cm4gZnVuY3Rpb24oaW5pdGlhbENvbnRhaW5lcnMsIG9wdGlvbnMpIHtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmICFBcnJheS5pc0FycmF5KGluaXRpYWxDb250YWluZXJzKSAmJiAhYW5ndWxhci5pc0VsZW1lbnQoaW5pdGlhbENvbnRhaW5lcnMpICYmICFpbml0aWFsQ29udGFpbmVyc1swXSkge1xuICAgICAgLy8gdGhlbiBjb250YWluZXJzIGFyZSBub3QgcHJvdmlkZWQsIG9ubHkgb3B0aW9uc1xuICAgICAgb3B0aW9ucyA9IGluaXRpYWxDb250YWluZXJzO1xuICAgICAgaW5pdGlhbENvbnRhaW5lcnMgPSBbXTtcbiAgICB9XG5cbiAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHksXG4gICAgICBkb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG4gICAgICBfc291cmNlLCAvLyBzb3VyY2UgY29udGFpbmVyXG4gICAgICBfaXRlbSwgLy8gaXRlbSBiZWluZyBkcmFnZ2VkXG4gICAgICBfc291cmNlTW9kZWwsIC8vIHNvdXJjZSBjb250YWluZXIgbW9kZWxcbiAgICAgIF9pdGVtTW9kZWwsIC8vIGl0ZW0tbW9kZWwgYmVpbmcgZHJhZ2dlZFxuICAgICAgX29mZnNldFgsIC8vIHJlZmVyZW5jZSB4XG4gICAgICBfb2Zmc2V0WSwgLy8gcmVmZXJlbmNlIHlcbiAgICAgIF9vZmZzZXRYciwgLy8gcmVmZXJlbmNlIHggcmlnaHQgZm9yIGJvdW5kaW5nQm94IGZlYXR1cmVcbiAgICAgIF9vZmZzZXRZYiwgLy8gcmVmZXJlbmNlIHkgYm90dG9tIGZvciBib3VuZGluZ0JveCBmZWF0dXJlXG4gICAgICBfY2xpZW50WCwgLy8gY2FjaGUgY2xpZW50IHgsIGluaXQgYXQgZ3JhYiwgdXBkYXRlIGF0IGRyYWdcbiAgICAgIF9jbGllbnRZLCAvLyBjYWNoZSBjbGllbnQgeSwgaW5pdCBhdCBncmFiLCB1cGRhdGUgYXQgZHJhZ1xuICAgICAgX21pcnJvcldpZHRoLCAvLyBtaXJyb3Igd2lkdGggZm9yIGJvdW5kaW5nQm94IGZlYXR1cmVcbiAgICAgIF9taXJyb3JIZWlnaHQsIC8vIG1pcnJvciBoZWlnaHQgZm9yIGJvdW5kaW5nQm94IGZlYXR1cmVcbiAgICAgIF9pbml0aWFsU2libGluZywgLy8gcmVmZXJlbmNlIHNpYmxpbmcgd2hlbiBncmFiYmVkXG4gICAgICBfY3VycmVudFNpYmxpbmcsIC8vIHJlZmVyZW5jZSBzaWJsaW5nIG5vd1xuICAgICAgX2luaXRpYWxJbmRleCwgLy8gcmVmZXJlbmNlIG1vZGVsIGluZGV4IHdoZW4gZ3JhYmJlZFxuICAgICAgX2N1cnJlbnRJbmRleCwgLy8gcmVmZXJlbmNlIG1vZGVsIGluZGV4IG5vd1xuICAgICAgX2xhc3RPdmVyRWxlbSwgLy8gbGFzdCBlbGVtZW50IGJlaGluZCB0aGUgY3Vyc29yIChkcmFnT3ZlckNsYXNzZXMgZmVhdHVyZSlcbiAgICAgIF9sYXN0T3ZlckNsYXNzLCAvLyBsYXN0IG92ZXJDbGFzcyB1c2VkIChkcmFnT3ZlckNsYXNzZXMgZmVhdHVyZSlcbiAgICAgIF9jb3B5LCAvLyBpdGVtIHVzZWQgZm9yIGNvcHlpbmdcbiAgICAgIF9jb3B5TW9kZWwsIC8vIGl0ZW0tbW9kZWwgdXNlZCBmb3IgY29weWluZ1xuICAgICAgX2NvbnRhaW5lcnMgPSB7fSwgLy8gY29udGFpbmVycyBtYW5hZ2VkIGJ5IHRoZSBkcmFrZVxuICAgICAgX2NvbnRhaW5lcnNNb2RlbCA9IHt9LCAvLyBjb250YWluZXJzIG1vZGVsXG4gICAgICBfcmVuZGVyVGltZXIsIC8vIHRpbWVyIGZvciBzZXRUaW1lb3V0IHJlbmRlck1pcnJvckltYWdlXG4gICAgICBfaXNDb250YWluZXIsIC8vIGludGVybmFsIGlzQ29udGFpbmVyXG4gICAgICBfZHJvcENvbnRhaW5lciwgLy8gZHJvcHBhYmxlIGNvbnRhaW5lciB1bmRlciBkcmFnIGl0ZW1cbiAgICAgIGRlZmF1bHRDbGFzc2VzID0ge1xuICAgICAgICBtaXJyb3I6ICdndS1taXJyb3InLFxuICAgICAgICBoaWRlOiAnZ3UtaGlkZScsXG4gICAgICAgIHVuc2VsZWN0YWJsZTogJ2d1LXVuc2VsZWN0YWJsZScsXG4gICAgICAgIHRyYW5zaXQ6ICdndS10cmFuc2l0JyxcbiAgICAgICAgb3ZlckFjdGl2ZTogJ2d1LW92ZXItYWN0aXZlJyxcbiAgICAgICAgb3ZlckFjY2VwdHM6ICdndS1vdmVyLWFjY2VwdCcsXG4gICAgICAgIG92ZXJEZWNsaW5lczogJ2d1LW92ZXItZGVjbGluZSdcbiAgICAgIH0sXG4gICAgICBvID0geyAvLyBvcHRpb25zXG4gICAgICAgIGNsYXNzZXM6IGRlZmF1bHRDbGFzc2VzLFxuICAgICAgICBjb250YWluZXJzOiBmYWxzZSxcbiAgICAgICAgbW92ZXM6IGFsd2F5cyxcbiAgICAgICAgYWNjZXB0czogYWx3YXlzLFxuICAgICAgICBpc0NvbnRhaW5lcjogbmV2ZXIsXG4gICAgICAgIGNvcHk6IGZhbHNlLFxuICAgICAgICBkZWxheTogZmFsc2UsXG4gICAgICAgIGludmFsaWQ6IGludmFsaWRUYXJnZXQsXG4gICAgICAgIHJldmVydE9uU3BpbGw6IGZhbHNlLFxuICAgICAgICByZW1vdmVPblNwaWxsOiBmYWxzZSxcbiAgICAgICAgZHJhZ092ZXJDbGFzc2VzOiBmYWxzZSxcbiAgICAgICAgbG9ja1g6IGZhbHNlLFxuICAgICAgICBsb2NrWTogZmFsc2UsXG4gICAgICAgIGJvdW5kaW5nQm94OiBmYWxzZSxcbiAgICAgICAgY29udGFpbmVyc01vZGVsOiBmYWxzZVxuICAgICAgfTtcblxuICAgIGlmICghaXNFbGVtZW50KG8uYm91bmRpbmdCb3gpKSB7XG4gICAgICBvLmJvdW5kaW5nQm94ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmNsYXNzZXMpIHtcbiAgICAgIGFuZ3VsYXIuZXh0ZW5kKGRlZmF1bHRDbGFzc2VzLCBvcHRpb25zLmNsYXNzZXMpO1xuICAgICAgYW5ndWxhci5leHRlbmQob3B0aW9ucy5jbGFzc2VzLCBkZWZhdWx0Q2xhc3Nlcyk7XG4gICAgfVxuXG4gICAgYW5ndWxhci5leHRlbmQobywgb3B0aW9ucyk7XG5cbiAgICBpZiAoby5kZWxheSA9PT0gdHJ1ZSkge1xuICAgICAgby5kZWxheSA9IDMwMDtcbiAgICB9XG5cbiAgICBpbml0aWFsQ29udGFpbmVycyA9IG8uY29udGFpbmVycyB8fCAoaW5pdGlhbENvbnRhaW5lcnMgPyBtYWtlQXJyYXkoaW5pdGlhbENvbnRhaW5lcnMpIDogW10pO1xuICAgIGlmKG8uY29udGFpbmVycyl7XG4gICAgICBpbml0aWFsQ29udGFpbmVycyA9IG1ha2VBcnJheShpbml0aWFsQ29udGFpbmVycyk7XG4gICAgfVxuICAgIGlmKG8uY29udGFpbmVyc01vZGVsKXtcbiAgICAgIG8uY29udGFpbmVyc01vZGVsID0gbWFrZUFycmF5KG8uY29udGFpbmVyc01vZGVsKTtcbiAgICB9XG5cbiAgICBpbml0aWFsQ29udGFpbmVycy5mb3JFYWNoKGZ1bmN0aW9uIGFkZE1vdXNlRG93biAoY29udGFpbmVyKSB7XG4gICAgICByZWdFdmVudChjb250YWluZXIsICdvbicsICdtb3VzZWRvd24nLCBncmFiKTtcbiAgICB9KTtcblxuICAgIGlmIChvLm5hbWVTcGFjZSkge1xuICAgICAgIGlmICghQXJyYXkuaXNBcnJheShvLm5hbWVTcGFjZSkpIHtcbiAgICAgICAgICBvLm5hbWVTcGFjZSA9IFtvLm5hbWVTcGFjZV07XG4gICAgICAgfVxuICAgICAgIGZ1bmN0aW9uIHByb2NlZWROYW1lU3BhY2VzKF9jb250YWluZXJzLCBjb250YWluZXJzTmFtZVNwYWNlZCwgbmFtZVNwYWNlLCBpbml0aWFsQ29udGFpbmVycyl7XG4gICAgICAgIGlmICghY29udGFpbmVyc05hbWVTcGFjZWRbbmFtZVNwYWNlXSkge1xuICAgICAgICAgIGNvbnRhaW5lcnNOYW1lU3BhY2VkW25hbWVTcGFjZV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShjb250YWluZXJzTmFtZVNwYWNlZFtuYW1lU3BhY2VdLCBpbml0aWFsQ29udGFpbmVycyk7XG4gICAgICAgIF9jb250YWluZXJzW25hbWVTcGFjZV0gPSBjb250YWluZXJzTmFtZVNwYWNlZFtuYW1lU3BhY2VdO1xuICAgICAgIH1cbiAgICAgIG8ubmFtZVNwYWNlLmZvckVhY2goZnVuY3Rpb24gZWFjaE5hbWVTcGFjZSAobmFtZVNwYWNlKSB7XG4gICAgICAgIHByb2NlZWROYW1lU3BhY2VzKF9jb250YWluZXJzLCBjb250YWluZXJzTmFtZVNwYWNlZCwgbmFtZVNwYWNlLCBpbml0aWFsQ29udGFpbmVycyk7XG4gICAgICAgIGlmKG8uY29udGFpbmVyc01vZGVsKXtcbiAgICAgICAgICBwcm9jZWVkTmFtZVNwYWNlcyhfY29udGFpbmVyc01vZGVsLCBjb250YWluZXJzTmFtZVNwYWNlZE1vZGVsLCBuYW1lU3BhY2UsIG8uY29udGFpbmVyc01vZGVsKVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIF9pc0NvbnRhaW5lciA9IGlzQ29udGFpbmVyTmFtZVNwYWNlZDtcbiAgICAgIF9pc0NvbnRhaW5lck1vZGVsID0gaXNDb250YWluZXJOYW1lU3BhY2VkTW9kZWw7XG4gICAgfWVsc2V7XG4gICAgICBfY29udGFpbmVycyA9IGluaXRpYWxDb250YWluZXJzO1xuICAgICAgX2lzQ29udGFpbmVyID0gaXNDb250YWluZXI7XG4gICAgICBpZihvLmNvbnRhaW5lcnNNb2RlbCl7XG4gICAgICAgICAgX2NvbnRhaW5lcnNNb2RlbCA9IG8uY29udGFpbmVyc01vZGVsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXZlbnRzKCk7XG5cbiAgICB2YXIgYXBpID0ge1xuICAgICAgYWRkQ29udGFpbmVyOiBtYW5pcHVsYXRlQ29udGFpbmVycygnYWRkJyksXG4gICAgICByZW1vdmVDb250YWluZXI6IG1hbmlwdWxhdGVDb250YWluZXJzKCdyZW1vdmUnKSxcbiAgICAgIGNvbnRhaW5lcnM6IF9jb250YWluZXJzLFxuICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgZW5kOiBlbmQsXG4gICAgICBjYW5jZWw6IGNhbmNlbCxcbiAgICAgIHJlbW92ZTogcmVtb3ZlLFxuICAgICAgZGVzdHJveTogZGVzdHJveSxcbiAgICAgIGRyYWdnaW5nOiBmYWxzZVxuICAgIH07XG5cbiAgICByZXR1cm4gYXBpO1xuXG5cbiAgICBmdW5jdGlvbiBtYWtlQXJyYXkoYWxsKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShhbGwpKSB7XG4gICAgICAgIHJldHVybiBhbGw7XG4gICAgICB9XG4gICAgICBpZiAoYWxsLmxlbmd0aCkgeyAvLyBpcyBhcnJheS1saWtlXG4gICAgICAgIHZhciBpQWxsID0gYWxsLmxlbmd0aCxcbiAgICAgICAgICBuZXdBcnJheSA9IFtdO1xuICAgICAgICB3aGlsZSAoaUFsbCkge1xuICAgICAgICAgIGlBbGwtLTtcbiAgICAgICAgICBuZXdBcnJheS5wdXNoKGFsbFtpQWxsXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld0FycmF5O1xuICAgICAgfSBlbHNlIHsgLy8gaXMgb25lIGVsZW1lbnRcbiAgICAgICAgcmV0dXJuIFthbGxdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hbmlwdWxhdGVDb250YWluZXJzKG9wKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gYWRkT3JSZW1vdmUoYWxsKSB7XG4gICAgICAgIHZhciBjaGFuZ2VzID0gQXJyYXkuaXNBcnJheShhbGwpID8gYWxsIDogbWFrZUFycmF5KGFsbCk7XG4gICAgICAgIGNoYW5nZXMuZm9yRWFjaChmdW5jdGlvbiBmb3JFYWNoQ29udGFpbmVyKGNvbnRhaW5lcikge1xuICAgICAgICAgIGlmKG8ubmFtZVNwYWNlKXtcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChvLm5hbWVTcGFjZSwgZnVuY3Rpb24gYWRkUmVtb3ZlTmFtZXNwYWNlZCAoY29udGFpbmVycywgbmFtZVNwYWNlKSB7XG4gICAgICAgICAgICAgIGlmIChvcCA9PT0gJ2FkZCcpIHtcbiAgICAgICAgICAgICAgICBfY29udGFpbmVyc1tuYW1lU3BhY2VdLnB1c2goY29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4gJiYgY29uc29sZS53YXJuKCdkcmFrZS5hZGRDb250YWluZXIgaXMgZGVwcmVjYXRlZC4gcGxlYXNlIGFjY2VzcyBkcmFrZS5jb250YWluZXJzIGRpcmVjdGx5LCBpbnN0ZWFkJyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX2NvbnRhaW5lcnNbbmFtZVNwYWNlXS5zcGxpY2UoX2NvbnRhaW5lcnMuaW5kZXhPZihjb250YWluZXIpLCAxKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4gJiYgY29uc29sZS53YXJuKCdkcmFrZS5yZW1vdmVDb250YWluZXIgaXMgZGVwcmVjYXRlZC4gcGxlYXNlIGFjY2VzcyBkcmFrZS5jb250YWluZXJzIGRpcmVjdGx5LCBpbnN0ZWFkJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgaWYgKG9wID09PSAnYWRkJykge1xuICAgICAgICAgICAgICBfY29udGFpbmVycy5wdXNoKGNvbnRhaW5lcik7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybiAmJiBjb25zb2xlLndhcm4oJ2RyYWtlLmFkZENvbnRhaW5lciBpcyBkZXByZWNhdGVkLiBwbGVhc2UgYWNjZXNzIGRyYWtlLmNvbnRhaW5lcnMgZGlyZWN0bHksIGluc3RlYWQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIF9jb250YWluZXJzLnNwbGljZShfY29udGFpbmVycy5pbmRleE9mKGNvbnRhaW5lciksIDEpO1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4gJiYgY29uc29sZS53YXJuKCdkcmFrZS5yZW1vdmVDb250YWluZXIgaXMgZGVwcmVjYXRlZC4gcGxlYXNlIGFjY2VzcyBkcmFrZS5jb250YWluZXJzIGRpcmVjdGx5LCBpbnN0ZWFkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNDb250YWluZXIoZWwpIHtcbiAgICAgIHJldHVybiBhcGkuY29udGFpbmVycy5pbmRleE9mKGVsKSAhPT0gLTEgfHwgby5pc0NvbnRhaW5lcihlbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNDb250YWluZXJOYW1lU3BhY2VkKGVsKSB7XG4gICAgICB2YXIgbmFtZVNwYWNlO1xuICAgICAgZm9yIChuYW1lU3BhY2UgaW4gYXBpLmNvbnRhaW5lcnMpIHtcbiAgICAgICAgICBpZiAoYXBpLmNvbnRhaW5lcnMuaGFzT3duUHJvcGVydHkobmFtZVNwYWNlKSAmJiBhcGkuY29udGFpbmVyc1tuYW1lU3BhY2VdLmluZGV4T2YoZWwpICE9PSAtMSkge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZihvLmlzQ29udGFpbmVyKGVsKSl7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV2ZW50cyhyZW0pIHtcbiAgICAgIHZhciBvcCA9IHJlbSA/ICdvZmYnIDogJ29uJztcbiAgICAgIHJlZ0V2ZW50KGRvY3VtZW50RWxlbWVudCwgb3AsICdtb3VzZXVwJywgcmVsZWFzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgIGV2ZW50cyh0cnVlKTtcbiAgICAgIGFwaS5yZW1vdmVDb250YWluZXIoX2NvbnRhaW5lcnMpO1xuICAgICAgcmVsZWFzZSh7fSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ3JhYihlKSB7XG4gICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG4gICAgICB2YXIgaXRlbSA9IGUudGFyZ2V0O1xuXG4gICAgICBpZiAoKGUud2hpY2ggIT09IDAgJiYgZS53aGljaCAhPT0gMSkgfHwgZS5tZXRhS2V5IHx8IGUuY3RybEtleSkge1xuICAgICAgICByZXR1cm47IC8vIHdlIG9ubHkgY2FyZSBhYm91dCBob25lc3QtdG8tZ29kIGxlZnQgY2xpY2tzIGFuZCB0b3VjaCBldmVudHNcbiAgICAgIH1cbiAgICAgIGlmIChzdGFydChpdGVtKSAhPT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghby5kaXJlY3Rpb24pIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGl0ZW0ucGFyZW50RWxlbWVudCxcbiAgICAgICAgICBwYXJlbnRIZWlnaHQgPSBwYXJlbnQub2Zmc2V0SGVpZ2h0LFxuICAgICAgICAgIHBhcmVudFdpZHRoID0gcGFyZW50Lm9mZnNldFdpZHRoLFxuICAgICAgICAgIGNoaWxkSGVpZ2h0ID0gaXRlbS5jbGllbnRIZWlnaHQsXG4gICAgICAgICAgY2hpbGRXaWR0aCA9IGl0ZW0uY2xpZW50V2lkdGg7XG4gICAgICAgIG8uZGlyZWN0aW9uID0gcGFyZW50SGVpZ2h0IC8gY2hpbGRIZWlnaHQgPCBwYXJlbnRXaWR0aCAvIGNoaWxkV2lkdGggPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnO1xuICAgICAgfVxuXG4gICAgICB2YXIgb2Zmc2V0ID0gZ2V0T2Zmc2V0KF9pdGVtKTtcbiAgICAgIF9vZmZzZXRYID0gZ2V0Q29vcmQoJ3BhZ2VYJywgZSkgLSBvZmZzZXQubGVmdDtcbiAgICAgIF9vZmZzZXRZID0gZ2V0Q29vcmQoJ3BhZ2VZJywgZSkgLSBvZmZzZXQudG9wO1xuICAgICAgX2NsaWVudFggPSBnZXRDb29yZCgnY2xpZW50WCcsIGUpO1xuICAgICAgX2NsaWVudFkgPSBnZXRDb29yZCgnY2xpZW50WScsIGUpO1xuICAgICAgaWYgKG8uYm91bmRpbmdCb3gpIHtcbiAgICAgICAgX29mZnNldFhyID0gZ2V0Q29vcmQoJ3BhZ2VYJywgZSkgLSBvZmZzZXQucmlnaHQ7XG4gICAgICAgIF9vZmZzZXRZYiA9IGdldENvb3JkKCdwYWdlWScsIGUpIC0gb2Zmc2V0LmJvdHRvbTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBvLmRlbGF5ID09PSAnbnVtYmVyJykge1xuICAgICAgICBfcmVuZGVyVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJlbmRlck1pcnJvckFuZERyYWcoZSk7XG4gICAgICAgIH0sIG8uZGVsYXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyTWlycm9yQW5kRHJhZyhlKTtcbiAgICAgIH1cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlck1pcnJvckFuZERyYWcoZSkge1xuICAgICAgcmVuZGVyTWlycm9ySW1hZ2UoKTtcbiAgICAgIC8vIGluaXRpYWwgcG9zaXRpb25cbiAgICAgIF9taXJyb3Iuc3R5bGUubGVmdCA9IF9jbGllbnRYIC0gX29mZnNldFggKyAncHgnO1xuICAgICAgX21pcnJvci5zdHlsZS50b3AgPSBfY2xpZW50WSAtIF9vZmZzZXRZICsgJ3B4JztcblxuICAgICAgZHJhZyhlKTtcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIHN0YXJ0KGl0ZW0pIHtcbiAgICAgIHZhciBoYW5kbGUgPSBpdGVtO1xuXG4gICAgICBpZiAoYXBpLmRyYWdnaW5nICYmIF9taXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoX2lzQ29udGFpbmVyKGl0ZW0pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gZG9uJ3QgZHJhZyBjb250YWluZXIgaXRzZWxmXG4gICAgICB9XG4gICAgICB3aGlsZSAoIV9pc0NvbnRhaW5lcihpdGVtLnBhcmVudEVsZW1lbnQpKSB7XG4gICAgICAgIGlmIChvLmludmFsaWQoaXRlbSwgaGFuZGxlKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpdGVtID0gaXRlbS5wYXJlbnRFbGVtZW50OyAvLyBkcmFnIHRhcmdldCBzaG91bGQgYmUgYSB0b3AgZWxlbWVudFxuICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgfVxuICAgICAgaWYgKG8uaW52YWxpZChpdGVtLCBoYW5kbGUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRhaW5lciA9IGl0ZW0ucGFyZW50RWxlbWVudCxcbiAgICAgICAgbW92YWJsZSA9IG8ubW92ZXMoaXRlbSwgY29udGFpbmVyLCBoYW5kbGUpO1xuICAgICAgaWYgKCFtb3ZhYmxlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgZW5kKCk7XG5cbiAgICAgIGlmIChvLmNvbnRhaW5lcnNNb2RlbCl7XG4gICAgICAgIHZhciBjb250YWluZXJJbmRleCA9IGluaXRpYWxDb250YWluZXJzLmluZGV4T2YoY29udGFpbmVyKSxcbiAgICAgICAgICBpdGVtSW5kZXggPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGFuZ3VsYXIuZWxlbWVudChpdGVtLnBhcmVudEVsZW1lbnQpLmNoaWxkcmVuKCksIGl0ZW0pO1xuXG4gICAgICAgIF9pbml0aWFsSW5kZXggPSBfY3VycmVudEluZGV4ID0gaXRlbUluZGV4O1xuICAgICAgICBfc291cmNlTW9kZWwgPSBvLmNvbnRhaW5lcnNNb2RlbFtjb250YWluZXJJbmRleF07XG4gICAgICAgIF9pdGVtTW9kZWwgPSBfc291cmNlTW9kZWxbaXRlbUluZGV4XTtcbiAgICAgICAgaWYoby5jb3B5KXtcbiAgICAgICAgICBfY29weU1vZGVsID0gYW5ndWxhci5jb3B5KF9pdGVtTW9kZWwpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChvLmNvcHkpIHtcbiAgICAgICAgX2NvcHkgPSBpdGVtLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgYWRkQ2xhc3MoX2NvcHksIG8uY2xhc3Nlcy50cmFuc2l0KTtcbiAgICAgICAgaWYgKG8uc2NvcGUpIHtcbiAgICAgICAgICBvLnNjb3BlLiRlbWl0KCdjbG9uZWQnLCBfY29weSwgaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFkZENsYXNzKGl0ZW0sIG8uY2xhc3Nlcy50cmFuc2l0KTtcbiAgICAgIH1cblxuICAgICAgX3NvdXJjZSA9IGNvbnRhaW5lcjtcbiAgICAgIF9pdGVtID0gaXRlbTtcbiAgICAgIF9pbml0aWFsU2libGluZyA9IF9jdXJyZW50U2libGluZyA9IG5leHRFbChpdGVtKTtcblxuICAgICAgYXBpLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICAgIGlmIChvLnNjb3BlKSB7XG4gICAgICAgIG8uc2NvcGUuJGVtaXQoJ2RyYWcnLCBfaXRlbSwgX3NvdXJjZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGludmFsaWRUYXJnZXQoZWwpIHtcbiAgICAgIHJldHVybiBlbC50YWdOYW1lID09PSAnQScgfHwgZWwudGFnTmFtZSA9PT0gJ0JVVFRPTic7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZW5kKCkge1xuICAgICAgaWYgKCFhcGkuZHJhZ2dpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICAgIGRyb3AoaXRlbSwgaXRlbS5wYXJlbnRFbGVtZW50KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWxlYXNlKGUpIHtcbiAgICAgIGlmICghYXBpLmRyYWdnaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblxuICAgICAgX2NsaWVudFggPSBnZXRDb29yZCgnY2xpZW50WCcsIGUpO1xuICAgICAgX2NsaWVudFkgPSBnZXRDb29yZCgnY2xpZW50WScsIGUpO1xuXG4gICAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtLFxuICAgICAgICBlbGVtZW50QmVoaW5kQ3Vyc29yID0gZ2V0RWxlbWVudEJlaGluZFBvaW50KF9taXJyb3IsIF9jbGllbnRYLCBfY2xpZW50WSksXG4gICAgICAgIGRyb3BUYXJnZXQgPSBmaW5kRHJvcFRhcmdldChlbGVtZW50QmVoaW5kQ3Vyc29yLCBfY2xpZW50WCwgX2NsaWVudFkpO1xuICAgICAgaWYgKGRyb3BUYXJnZXQgJiYgKG8uY29weSA9PT0gZmFsc2UgfHwgZHJvcFRhcmdldCAhPT0gX3NvdXJjZSkpIHtcbiAgICAgICAgZHJvcChpdGVtLCBkcm9wVGFyZ2V0KTtcbiAgICAgIH0gZWxzZSBpZiAoby5yZW1vdmVPblNwaWxsKSB7XG4gICAgICAgIHJlbW92ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FuY2VsKCk7XG4gICAgICB9XG4gICAgICBpZiAoby5kcmFnT3ZlckNsYXNzZXMgJiYgX2xhc3RPdmVyRWxlbSkge1xuICAgICAgICBybUNsYXNzKF9sYXN0T3ZlckVsZW0sIF9sYXN0T3ZlckNsYXNzKTtcbiAgICAgICAgX2Ryb3BDb250YWluZXIgPSBudWxsO1xuICAgICAgICBfbGFzdE92ZXJFbGVtID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcm9wKGl0ZW0sIHRhcmdldCkge1xuICAgICAgaWYgKG8uc2NvcGUgJiYgaXNJbml0aWFsUGxhY2VtZW50KHRhcmdldCkpIHtcbiAgICAgICAgby5zY29wZS4kZW1pdCgnY2FuY2VsJywgaXRlbSwgX3NvdXJjZSk7XG4gICAgICB9IGVsc2UgaWYgKG8uc2NvcGUpIHtcbiAgICAgICAgby5zY29wZS4kZW1pdCgnZHJvcCcsIGl0ZW0sIHRhcmdldCwgX3NvdXJjZSk7XG4gICAgICB9XG4gICAgICBjbGVhbnVwKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgaWYgKCFhcGkuZHJhZ2dpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbSxcbiAgICAgICAgcGFyZW50ID0gaXRlbS5wYXJlbnRFbGVtZW50O1xuICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgICB9XG4gICAgICBpZihvLmNvbnRhaW5lcnNNb2RlbCAmJiAhby5jb3B5KXtcbiAgICAgICAgX3NvdXJjZU1vZGVsLnNwbGljZShfc291cmNlTW9kZWwuaW5kZXhPZihfaXRlbU1vZGVsKSwxKTtcbiAgICAgIH1cbiAgICAgIGlmIChvLnNjb3BlKSB7XG4gICAgICAgIG8uc2NvcGUuJGVtaXQoby5jb3B5ID8gJ2NhbmNlbCcgOiAncmVtb3ZlJywgaXRlbSwgcGFyZW50KTtcbiAgICAgIH1cbiAgICAgIGNsZWFudXAoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5jZWwocmV2ZXJ0KSB7XG4gICAgICBpZiAoIWFwaS5kcmFnZ2luZykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgcmV2ZXJ0cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwID8gcmV2ZXJ0IDogby5yZXZlcnRPblNwaWxsLFxuICAgICAgICBpdGVtID0gX2NvcHkgfHwgX2l0ZW0sXG4gICAgICAgIHBhcmVudCA9IGl0ZW0ucGFyZW50RWxlbWVudDtcbiAgICAgIGlmIChwYXJlbnQgPT09IF9zb3VyY2UgJiYgby5jb3B5KSB7XG4gICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChfY29weSk7XG4gICAgICB9XG4gICAgICB2YXIgaW5pdGlhbCA9IGlzSW5pdGlhbFBsYWNlbWVudChwYXJlbnQpO1xuICAgICAgaWYgKGluaXRpYWwgPT09IGZhbHNlICYmIG8uY29weSA9PT0gZmFsc2UgJiYgcmV2ZXJ0cykge1xuICAgICAgICBfc291cmNlLmluc2VydEJlZm9yZShpdGVtLCBfaW5pdGlhbFNpYmxpbmcpO1xuICAgICAgICBpZihvLmNvbnRhaW5lcnNNb2RlbCl7XG4gICAgICAgICAgX3NvdXJjZU1vZGVsLnNwbGljZShfaW5pdGlhbEluZGV4LCAxLCBfaXRlbU1vZGVsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG8uc2NvcGUgJiYgKGluaXRpYWwgfHwgcmV2ZXJ0cykpIHtcbiAgICAgICAgby5zY29wZS4kZW1pdCgnY2FuY2VsJywgaXRlbSwgX3NvdXJjZSk7XG4gICAgICB9IGVsc2UgaWYgKG8uc2NvcGUpIHtcbiAgICAgICAgby5zY29wZS4kZW1pdCgnZHJvcCcsIGl0ZW0sIHBhcmVudCwgX3NvdXJjZSk7XG4gICAgICB9XG4gICAgICBjbGVhbnVwKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYW51cCgpIHtcbiAgICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgICByZW1vdmVNaXJyb3JJbWFnZSgpO1xuICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgcm1DbGFzcyhpdGVtLCBvLmNsYXNzZXMudHJhbnNpdCk7XG4gICAgICB9XG4gICAgICBpZiAoX3JlbmRlclRpbWVyKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChfcmVuZGVyVGltZXIpO1xuICAgICAgfVxuICAgICAgX3NvdXJjZSA9IF9pdGVtID0gX2NvcHkgPSBfaW5pdGlhbFNpYmxpbmcgPSBfY3VycmVudFNpYmxpbmcgPSBfc291cmNlTW9kZWwgPSBfaXRlbU1vZGVsID0gX2NvcHlNb2RlbCA9IF9pbml0aWFsSW5kZXggPSBfY3VycmVudEluZGV4ID0gX3JlbmRlclRpbWVyID0gbnVsbDtcblxuICAgICAgYXBpLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICBpZiAoby5zY29wZSkge1xuICAgICAgICBvLnNjb3BlLiRlbWl0KCdkcmFnZW5kJywgaXRlbSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNJbml0aWFsUGxhY2VtZW50KHRhcmdldCwgcykge1xuICAgICAgdmFyIHNpYmxpbmc7XG4gICAgICBpZiAocyAhPT0gdm9pZCAwKSB7XG4gICAgICAgIHNpYmxpbmcgPSBzO1xuICAgICAgfSBlbHNlIGlmIChfbWlycm9yKSB7XG4gICAgICAgIHNpYmxpbmcgPSBfY3VycmVudFNpYmxpbmc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaWJsaW5nID0gbmV4dEVsKF9pdGVtIHx8IF9jb3B5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0YXJnZXQgPT09IF9zb3VyY2UgJiYgc2libGluZyA9PT0gX2luaXRpYWxTaWJsaW5nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbmREcm9wVGFyZ2V0KGVsZW1lbnRCZWhpbmRDdXJzb3IsIGNsaWVudFgsIGNsaWVudFkpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBlbGVtZW50QmVoaW5kQ3Vyc29yO1xuICAgICAgd2hpbGUgKHRhcmdldCAmJiAhYWNjZXB0ZWQoKSkge1xuICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50RWxlbWVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0YXJnZXQ7XG5cbiAgICAgIGZ1bmN0aW9uIGFjY2VwdGVkKCkge1xuICAgICAgICB2YXIgYWNjZXB0cyA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChfaXNDb250YWluZXIodGFyZ2V0KSkgeyAvLyBpcyBkcm9wcGFibGU/XG4gICAgICAgICAgdmFyIGltbWVkaWF0ZSA9IGdldEltbWVkaWF0ZUNoaWxkKHRhcmdldCwgZWxlbWVudEJlaGluZEN1cnNvciksXG4gICAgICAgICAgICByZWZlcmVuY2UgPSBnZXRSZWZlcmVuY2UodGFyZ2V0LCBpbW1lZGlhdGUsIGNsaWVudFgsIGNsaWVudFkpLFxuICAgICAgICAgICAgaW5pdGlhbCA9IGlzSW5pdGlhbFBsYWNlbWVudCh0YXJnZXQsIHJlZmVyZW5jZSk7XG4gICAgICAgICAgYWNjZXB0cyA9IGluaXRpYWwgPyB0cnVlIDogby5hY2NlcHRzKF9pdGVtLCB0YXJnZXQsIF9zb3VyY2UsIHJlZmVyZW5jZSwgX2l0ZW1Nb2RlbCwgX3NvdXJjZU1vZGVsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvLmRyYWdPdmVyQ2xhc3NlcyAmJlxuICAgICAgICAgIGhhc0NsYXNzKHRhcmdldCwgby5jbGFzc2VzLm92ZXJBY3RpdmUpICYmXG4gICAgICAgICAgdGFyZ2V0ICE9PSBfbGFzdE92ZXJFbGVtKSB7XG5cbiAgICAgICAgICBpZiAoX2xhc3RPdmVyRWxlbSkge1xuICAgICAgICAgICAgcm1DbGFzcyhfbGFzdE92ZXJFbGVtLCBfbGFzdE92ZXJDbGFzcyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgX2xhc3RPdmVyQ2xhc3MgPSBhY2NlcHRzID8gby5jbGFzc2VzLm92ZXJBY2NlcHRzIDogby5jbGFzc2VzLm92ZXJEZWNsaW5lcztcbiAgICAgICAgICBhZGRDbGFzcyh0YXJnZXQsIF9sYXN0T3ZlckNsYXNzKTtcbiAgICAgICAgICBfZHJvcENvbnRhaW5lciA9IGFjY2VwdHMgPyB0YXJnZXQgOiBudWxsO1xuICAgICAgICAgIF9sYXN0T3ZlckVsZW0gPSB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjY2VwdHM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZERyb3BUYXJnZXRNb2RlbCh0YXJnZXQpIHtcbiAgICAgIHZhciB0YXJnZXRNb2RlbCA9IGZhbHNlO1xuICAgICAgaWYoby5uYW1lU3BhY2Upe1xuICAgICAgICBvLm5hbWVTcGFjZS5mb3JFYWNoKGZ1bmN0aW9uIGZpbmREcm9wVGFyZ2V0TW9kZWxJbk5hbWVTcGFjZSAobmFtZVNwYWNlKSB7XG4gICAgICAgICAgaWYoIXRhcmdldE1vZGVsICYmIF9jb250YWluZXJzTW9kZWxbbmFtZVNwYWNlXS5pbmRleE9mKHRhcmdldCkgIT09IC0xKXtcbiAgICAgICAgICAgIHRhcmdldE1vZGVsID0gX2NvbnRhaW5lcnNNb2RlbFtuYW1lU3BhY2VdW19jb250YWluZXJzTW9kZWxbbmFtZVNwYWNlXS5pbmRleE9mKHRhcmdldCldO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYoX2NvbnRhaW5lcnNNb2RlbC5pbmRleE9mKHRhcmdldCkgIT09IC0xKXtcbiAgICAgICAgICAgIHRhcmdldE1vZGVsID0gX2NvbnRhaW5lcnNNb2RlbFtfY29udGFpbmVyc01vZGVsLmluZGV4T2YodGFyZ2V0KV07XG4gICAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZighdGFyZ2V0TW9kZWwgJiYgby5pc0NvbnRhaW5lck1vZGVsKXtcbiAgICAgICAgdmFyIHNjb3BlID0gYW5ndWxhci5lbGVtZW50KHRhcmdldCkuc2NvcGUoKSB8fCBhbmd1bGFyLmVsZW1lbnQodGFyZ2V0KS5pc29sYXRlU2NvcGUoKTtcbiAgICAgICAgaWYoc2NvcGUpe1xuICAgICAgICAgIHRhcmdldE1vZGVsID0gc2NvcGVbby5pc0NvbnRhaW5lck1vZGVsXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRhcmdldE1vZGVsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYWcoZSkge1xuICAgICAgaWYgKCFfbWlycm9yKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblxuICAgICAgX2NsaWVudFggPSBnZXRDb29yZCgnY2xpZW50WCcsIGUpO1xuICAgICAgX2NsaWVudFkgPSBnZXRDb29yZCgnY2xpZW50WScsIGUpO1xuXG4gICAgICB2YXIgeCA9IF9jbGllbnRYIC0gX29mZnNldFgsXG4gICAgICAgIHkgPSBfY2xpZW50WSAtIF9vZmZzZXRZLFxuICAgICAgICBwYWdlWCxcbiAgICAgICAgcGFnZVksXG4gICAgICAgIG9mZnNldEJveDtcblxuICAgICAgaWYgKG8uYm91bmRpbmdCb3gpIHtcbiAgICAgICAgcGFnZVggPSBnZXRDb29yZCgncGFnZVgnLCBlKTtcbiAgICAgICAgcGFnZVkgPSBnZXRDb29yZCgncGFnZVknLCBlKTtcbiAgICAgICAgb2Zmc2V0Qm94ID0gZ2V0T2Zmc2V0KG8uYm91bmRpbmdCb3gpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIW8ubG9ja1kpIHtcbiAgICAgICAgaWYgKCFvLmJvdW5kaW5nQm94IHx8IChwYWdlWCA+IG9mZnNldEJveC5sZWZ0ICsgX29mZnNldFggJiYgcGFnZVggPCBvZmZzZXRCb3gucmlnaHQgKyBfb2Zmc2V0WHIpKSB7XG4gICAgICAgICAgX21pcnJvci5zdHlsZS5sZWZ0ID0geCArICdweCc7XG4gICAgICAgIH0gZWxzZSBpZiAoby5ib3VuZGluZ0JveCkgeyAvLyBpbiBjYXNlIHVzZXIgc2Nyb2xsXG4gICAgICAgICAgaWYgKHBhZ2VYIDwgb2Zmc2V0Qm94LmxlZnQgKyBfb2Zmc2V0WCkge1xuICAgICAgICAgICAgX21pcnJvci5zdHlsZS5sZWZ0ID0gX2NsaWVudFggLSAocGFnZVggLSBvZmZzZXRCb3gubGVmdCkgKyAncHgnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfbWlycm9yLnN0eWxlLmxlZnQgPSBfY2xpZW50WCAtIF9taXJyb3JXaWR0aCAtIChwYWdlWCAtIG9mZnNldEJveC5yaWdodCkgKyAncHgnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFvLmxvY2tYKSB7XG4gICAgICAgIGlmICghby5ib3VuZGluZ0JveCB8fCAocGFnZVkgPiBvZmZzZXRCb3gudG9wICsgX29mZnNldFkgJiYgcGFnZVkgPCBvZmZzZXRCb3guYm90dG9tICsgX29mZnNldFliKSkge1xuICAgICAgICAgIF9taXJyb3Iuc3R5bGUudG9wID0geSArICdweCc7XG4gICAgICAgIH0gZWxzZSBpZiAoby5ib3VuZGluZ0JveCkgeyAvLyBpbiBjYXNlIHVzZXIgc2Nyb2xsXG4gICAgICAgICAgaWYgKHBhZ2VZIDwgb2Zmc2V0Qm94LnRvcCArIF9vZmZzZXRZKSB7XG4gICAgICAgICAgICBfbWlycm9yLnN0eWxlLnRvcCA9IF9jbGllbnRZIC0gKHBhZ2VZIC0gb2Zmc2V0Qm94LnRvcCkgKyAncHgnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfbWlycm9yLnN0eWxlLnRvcCA9IF9jbGllbnRZIC0gX21pcnJvckhlaWdodCAtIChwYWdlWSAtIG9mZnNldEJveC5ib3R0b20pICsgJ3B4JztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbSxcbiAgICAgICAgZWxlbWVudEJlaGluZEN1cnNvciA9IGdldEVsZW1lbnRCZWhpbmRQb2ludChfbWlycm9yLCBfY2xpZW50WCwgX2NsaWVudFkpLFxuICAgICAgICBkcm9wVGFyZ2V0ID0gZmluZERyb3BUYXJnZXQoZWxlbWVudEJlaGluZEN1cnNvciwgX2NsaWVudFgsIF9jbGllbnRZKTtcblxuICAgICAgaWYgKGRyb3BUYXJnZXQgPT09IF9zb3VyY2UgJiYgby5jb3B5KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlZmVyZW5jZSxcbiAgICAgICAgaW1tZWRpYXRlID0gZ2V0SW1tZWRpYXRlQ2hpbGQoZHJvcFRhcmdldCwgZWxlbWVudEJlaGluZEN1cnNvcik7XG5cbiAgICAgIGlmKG8uY29udGFpbmVyc01vZGVsKXtcbiAgICAgICAgdmFyIGl0ZW1Nb2RlbCA9IF9jb3B5TW9kZWwgfHwgX2l0ZW1Nb2RlbCxcbiAgICAgICAgICB0YXJnZXRNb2RlbCA9IGZpbmREcm9wVGFyZ2V0TW9kZWwodGFyZ2V0KSxcbiAgICAgICAgICByZWZlcmVuY2VJbmRleCA9IHRhcmdldE1vZGVsID8gdGFyZ2V0TW9kZWwuaW5kZXhPZihfaXRlbU1vZGVsKSA6IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbW1lZGlhdGUgIT09IG51bGwpIHtcbiAgICAgICAgcmVmZXJlbmNlID0gZ2V0UmVmZXJlbmNlKGRyb3BUYXJnZXQsIGltbWVkaWF0ZSwgX2NsaWVudFgsIF9jbGllbnRZKTtcbiAgICAgIH0gZWxzZSBpZiAoby5yZXZlcnRPblNwaWxsID09PSB0cnVlICYmICFvLmNvcHkpIHtcbiAgICAgICAgcmVmZXJlbmNlID0gX2luaXRpYWxTaWJsaW5nO1xuICAgICAgICBkcm9wVGFyZ2V0ID0gX3NvdXJjZTtcbiAgICAgICAgaWYoby5jb250YWluZXJzTW9kZWwpe1xuICAgICAgICAgIHJlZmVyZW5jZUluZGV4ID0gX2luaXRpYWxJbmRleDtcbiAgICAgICAgICB0YXJnZXRNb2RlbCA9IF9zb3VyY2VNb2RlbDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKChvLmNvcHkgfHwgby5yZW1vdmVPblNwaWxsID09PSB0cnVlKSAmJiBpdGVtLnBhcmVudEVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICBpdGVtLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgICAgICAgaWYoby5jb250YWluZXJzTW9kZWwpe1xuICAgICAgICAgICAgdGFyZ2V0TW9kZWwuc3BsaWNlKHJlZmVyZW5jZUluZGV4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHJlZmVyZW5jZSA9PT0gbnVsbCB8fCByZWZlcmVuY2UgIT09IGl0ZW0gJiYgcmVmZXJlbmNlICE9PSBuZXh0RWwoaXRlbSkpIHtcbiAgICAgICAgX2N1cnJlbnRTaWJsaW5nID0gcmVmZXJlbmNlO1xuICAgICAgICBkcm9wVGFyZ2V0Lmluc2VydEJlZm9yZShpdGVtLCByZWZlcmVuY2UpO1xuXG4gICAgICAgIGlmKG8uY29udGFpbmVyc01vZGVsKXtcbiAgICAgICAgICBfY3VycmVudEluZGV4ID0gcmVmZXJlbmNlSW5kZXg7XG4gICAgICAgICAgdGFyZ2V0TW9kZWwuc3BsaWNlKHJlZmVyZW5jZUluZGV4LCAxLCBfaXRlbU1vZGVsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvLnNjb3BlKSB7XG4gICAgICAgICAgby5zY29wZS4kZW1pdCgnc2hhZG93JywgaXRlbSwgZHJvcFRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzY3JvbGxDb250YWluZXIoZSl7ICAgXG4gICAgICBfZHJvcENvbnRhaW5lci5zY3JvbGxUb3AgKz0gZS5kZWx0YVk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyTWlycm9ySW1hZ2UoKSB7XG4gICAgICBpZiAoX21pcnJvcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgcmVjdCA9IF9pdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgX21pcnJvciA9IF9pdGVtLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgIF9taXJyb3JXaWR0aCA9IHJlY3Qud2lkdGg7XG4gICAgICBfbWlycm9ySGVpZ2h0ID0gcmVjdC5oZWlnaHQ7XG4gICAgICBfbWlycm9yLnN0eWxlLndpZHRoID0gZ2V0UmVjdFdpZHRoKHJlY3QpICsgJ3B4JztcbiAgICAgIF9taXJyb3Iuc3R5bGUuaGVpZ2h0ID0gZ2V0UmVjdEhlaWdodChyZWN0KSArICdweCc7XG4gICAgICBybUNsYXNzKF9taXJyb3IsIG8uY2xhc3Nlcy50cmFuc2l0KTtcbiAgICAgIGFkZENsYXNzKF9taXJyb3IsIG8uY2xhc3Nlcy5taXJyb3IpO1xuICAgICAgYm9keS5hcHBlbmRDaGlsZChfbWlycm9yKTtcbiAgICAgIHJlZ0V2ZW50KGRvY3VtZW50RWxlbWVudCwgJ29uJywgJ21vdXNlbW92ZScsIGRyYWcpO1xuICAgICAgYWRkQ2xhc3MoYm9keSwgby5jbGFzc2VzLnVuc2VsZWN0YWJsZSk7XG4gICAgICByZWdFdmVudChfbWlycm9yLCAnb24nLCAnd2hlZWwnLCBzY3JvbGxDb250YWluZXIpO1xuICAgICAgaWYgKG8uc2NvcGUpIHtcbiAgICAgICAgby5zY29wZS4kZW1pdCgnY2xvbmVkJywgX21pcnJvciwgX2l0ZW0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZU1pcnJvckltYWdlKCkge1xuICAgICAgaWYgKF9taXJyb3IpIHtcbiAgICAgICAgcm1DbGFzcyhib2R5LCBvLmNsYXNzZXMudW5zZWxlY3RhYmxlKTtcbiAgICAgICAgcmVnRXZlbnQoZG9jdW1lbnRFbGVtZW50LCAnb2ZmJywgJ21vdXNlbW92ZScsIGRyYWcpO1xuICAgICAgICByZWdFdmVudChfbWlycm9yLCAnb2ZmJywgJ3doZWVsJywgc2Nyb2xsQ29udGFpbmVyKTtcbiAgICAgICAgX21pcnJvci5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKF9taXJyb3IpO1xuICAgICAgICBfbWlycm9yID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRJbW1lZGlhdGVDaGlsZChkcm9wVGFyZ2V0LCB0YXJnZXQpIHtcbiAgICAgIHZhciBpbW1lZGlhdGUgPSB0YXJnZXQ7XG4gICAgICB3aGlsZSAoaW1tZWRpYXRlICE9PSBkcm9wVGFyZ2V0ICYmIGltbWVkaWF0ZS5wYXJlbnRFbGVtZW50ICE9PSBkcm9wVGFyZ2V0KSB7XG4gICAgICAgIGltbWVkaWF0ZSA9IGltbWVkaWF0ZS5wYXJlbnRFbGVtZW50O1xuICAgICAgfVxuICAgICAgaWYgKGltbWVkaWF0ZSA9PT0gZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGltbWVkaWF0ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRSZWZlcmVuY2UoZHJvcFRhcmdldCwgdGFyZ2V0LCB4LCB5KSB7XG4gICAgICB2YXIgaG9yaXpvbnRhbCA9IG8uZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCc7XG4gICAgICB2YXIgcmVmZXJlbmNlID0gdGFyZ2V0ICE9PSBkcm9wVGFyZ2V0ID8gaW5zaWRlKCkgOiBvdXRzaWRlKCk7XG4gICAgICByZXR1cm4gcmVmZXJlbmNlO1xuXG4gICAgICBmdW5jdGlvbiBvdXRzaWRlKCkgeyAvLyBzbG93ZXIsIGJ1dCBhYmxlIHRvIGZpZ3VyZSBvdXQgYW55IHBvc2l0aW9uXG4gICAgICAgIHZhciBsZW4gPSBkcm9wVGFyZ2V0LmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIHZhciBlbDtcbiAgICAgICAgdmFyIHJlY3Q7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGVsID0gZHJvcFRhcmdldC5jaGlsZHJlbltpXTtcbiAgICAgICAgICByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgaWYgKGhvcml6b250YWwgJiYgcmVjdC5sZWZ0ID4geCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWhvcml6b250YWwgJiYgcmVjdC50b3AgPiB5KSB7XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbnNpZGUoKSB7IC8vIGZhc3RlciwgYnV0IG9ubHkgYXZhaWxhYmxlIGlmIGRyb3BwZWQgaW5zaWRlIGEgY2hpbGQgZWxlbWVudFxuICAgICAgICB2YXIgcmVjdCA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKGhvcml6b250YWwpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh4ID4gcmVjdC5sZWZ0ICsgZ2V0UmVjdFdpZHRoKHJlY3QpIC8gMik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoeSA+IHJlY3QudG9wICsgZ2V0UmVjdEhlaWdodChyZWN0KSAvIDIpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByZXNvbHZlKGFmdGVyKSB7XG4gICAgICAgIHJldHVybiBhZnRlciA/IG5leHRFbCh0YXJnZXQpIDogdGFyZ2V0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNjcm9sbChzY3JvbGxQcm9wLCBvZmZzZXRQcm9wKSB7XG4gICAgICBpZiAodHlwZW9mIHdpbmRvd1tvZmZzZXRQcm9wXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvd1tvZmZzZXRQcm9wXTtcbiAgICAgIH1cbiAgICAgIGlmIChkb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgIHJldHVybiBkb2N1bWVudEVsZW1lbnRbc2Nyb2xsUHJvcF07XG4gICAgICB9XG4gICAgICByZXR1cm4gYm9keVtzY3JvbGxQcm9wXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRPZmZzZXQoZWwpIHtcbiAgICAgIHZhciByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgIHNjcm9sbFRvcCA9IGdldFNjcm9sbCgnc2Nyb2xsVG9wJywgJ3BhZ2VZT2Zmc2V0JyksXG4gICAgICAgIHNjcm9sbExlZnQgPSBnZXRTY3JvbGwoJ3Njcm9sbExlZnQnLCAncGFnZVhPZmZzZXQnKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IHJlY3QubGVmdCArIHNjcm9sbExlZnQsXG4gICAgICAgIHJpZ2h0OiByZWN0LnJpZ2h0ICsgc2Nyb2xsTGVmdCxcbiAgICAgICAgdG9wOiByZWN0LnRvcCArIHNjcm9sbFRvcCxcbiAgICAgICAgYm90dG9tOiByZWN0LmJvdHRvbSArIHNjcm9sbFRvcFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRFbGVtZW50QmVoaW5kUG9pbnQocG9pbnQsIHgsIHkpIHtcbiAgICAgIGlmICgheCAmJiAheSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZhciBwID0gcG9pbnQgfHwge30sXG4gICAgICAgIHN0YXRlID0gcC5jbGFzc05hbWUsXG4gICAgICAgIGVsO1xuICAgICAgcC5jbGFzc05hbWUgKz0gJyAnICsgby5jbGFzc2VzLmhpZGU7XG4gICAgICBlbCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gICAgICBwLmNsYXNzTmFtZSA9IHN0YXRlO1xuICAgICAgcmV0dXJuIGVsO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiByZWdFdmVudChlbCwgb3AsIHR5cGUsIGZuKSB7XG4gICAgdmFyIHRvdWNoID0ge1xuICAgICAgICBtb3VzZXVwOiAndG91Y2hlbmQnLFxuICAgICAgICBtb3VzZWRvd246ICd0b3VjaHN0YXJ0JyxcbiAgICAgICAgbW91c2Vtb3ZlOiAndG91Y2htb3ZlJ1xuICAgICAgfSxcbiAgICAgICRlbCA9IGFuZ3VsYXIuZWxlbWVudChlbCk7XG5cbiAgICBpZih0eXBlICE9PSAnd2hlZWwnKXskZWxbb3BdKHRvdWNoW3R5cGVdLCBmbil9O1xuICAgICRlbFtvcF0odHlwZSwgZm4pO1xuICB9XG5cbiAgZnVuY3Rpb24gbmV2ZXIoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWx3YXlzKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gbmV4dEVsKGVsKSB7XG4gICAgcmV0dXJuIGVsLm5leHRFbGVtZW50U2libGluZyB8fCBtYW51YWxseSgpO1xuXG4gICAgZnVuY3Rpb24gbWFudWFsbHkoKSB7XG4gICAgICB2YXIgc2libGluZyA9IGVsO1xuICAgICAgZG8ge1xuICAgICAgICBzaWJsaW5nID0gc2libGluZy5uZXh0U2libGluZztcbiAgICAgIH0gd2hpbGUgKHNpYmxpbmcgJiYgc2libGluZy5ub2RlVHlwZSAhPT0gMSk7XG4gICAgICByZXR1cm4gc2libGluZztcbiAgICB9XG4gIH1cblxuICAvL0Nhbm5vdCB1c2UgYW5ndWxhci5pc0VsZW1lbnQgYmVjYXVzZSB3ZSBuZWVkIHRvIGNoZWNrIHBsYWluIGRvbSBlbGVtZW50LCBubyBqUWxpdGUgd3JhcHBlZCAgXG4gIGZ1bmN0aW9uIGlzRWxlbWVudChvKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHR5cGVvZiBIVE1MRWxlbWVudCA9PT0gJ29iamVjdCcgPyBvIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgOiAvL0RPTTJcbiAgICAgIG8gJiYgdHlwZW9mIG8gPT09ICdvYmplY3QnICYmIG8gIT09IG51bGwgJiYgby5ub2RlVHlwZSA9PT0gMSAmJiB0eXBlb2Ygby5ub2RlTmFtZSA9PT0gJ3N0cmluZydcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQ2xhc3MoZWwsIGNsYXNzTmFtZSkge1xuICAgIGlmIChlbC5jbGFzc05hbWUuaW5kZXhPZignICcgKyBjbGFzc05hbWUpID09PSAtMSkge1xuICAgICAgZWwuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBybUNsYXNzKGVsLCBjbGFzc05hbWUpIHtcbiAgICBhbmd1bGFyLmVsZW1lbnQoZWwpLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XG4gIH1cblxuICBmdW5jdGlvbiBoYXNDbGFzcyhlbCwgY2xhc3NOYW1lKSB7XG4gICAgcmV0dXJuICgnICcgKyBlbC5jbGFzc05hbWUgKyAnICcpLmluZGV4T2YoJyAnICsgY2xhc3NOYW1lICsgJyAnKSA+IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0RXZlbnRIb3N0KGUpIHtcbiAgICAvLyBvbiB0b3VjaGVuZCBldmVudCwgd2UgaGF2ZSB0byB1c2UgYGUuY2hhbmdlZFRvdWNoZXNgXG4gICAgLy8gc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNzE5MjU2My90b3VjaGVuZC1ldmVudC1wcm9wZXJ0aWVzXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8zNFxuICAgIGlmIChlLnRhcmdldFRvdWNoZXMgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGUudGFyZ2V0VG91Y2hlc1swXTtcbiAgICB9XG4gICAgaWYgKGUuY2hhbmdlZFRvdWNoZXMgJiYgZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBlLmNoYW5nZWRUb3VjaGVzWzBdO1xuICAgIH1cbiAgICByZXR1cm4gZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldENvb3JkKGNvb3JkLCBlKSB7XG4gICAgdmFyIGhvc3QgPSBnZXRFdmVudEhvc3QoZSk7XG4gICAgdmFyIG1pc3NNYXAgPSB7XG4gICAgICBwYWdlWDogJ2NsaWVudFgnLCAvLyBJRThcbiAgICAgIHBhZ2VZOiAnY2xpZW50WScgLy8gSUU4XG4gICAgfTtcbiAgICBpZiAoY29vcmQgaW4gbWlzc01hcCAmJiAhKGNvb3JkIGluIGhvc3QpICYmIG1pc3NNYXBbY29vcmRdIGluIGhvc3QpIHtcbiAgICAgIGNvb3JkID0gbWlzc01hcFtjb29yZF07XG4gICAgfVxuICAgIHJldHVybiBob3N0W2Nvb3JkXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFJlY3RXaWR0aChyZWN0KSB7XG4gICAgcmV0dXJuIHJlY3Qud2lkdGggfHwgKHJlY3QucmlnaHQgLSByZWN0LmxlZnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UmVjdEhlaWdodChyZWN0KSB7XG4gICAgcmV0dXJuIHJlY3QuaGVpZ2h0IHx8IChyZWN0LmJvdHRvbSAtIHJlY3QudG9wKTtcbiAgfVxuXG59KS5kaXJlY3RpdmUoJ2RyYWd1bGFyJywgWydkcmFndWxhclNlcnZpY2UnLCBmdW5jdGlvbihkcmFndWxhclNlcnZpY2UpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgaUVsbSwgaUF0dHJzKSB7XG4gICAgICBkcmFndWxhclNlcnZpY2UoaUVsbVswXSwgJHNjb3BlW2lBdHRycy5kcmFndWxhciB8fCAndW5kZWZpbmVkJ10gfHwgdHJ5SnNvbihpQXR0cnMuZHJhZ3VsYXIpKTtcblxuICAgICAgZnVuY3Rpb24gdHJ5SnNvbihqc29uKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoanNvbik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlLCAnRHJhZ3VsYXI6IG5vdCB2YWxpZCBKU09OIGZvciBvcHRpb25zIScsIGlFbG0pO1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG59XSk7XG4iXX0=

//# sourceMappingURL=dragular.js.map
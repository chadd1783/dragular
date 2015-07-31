'use strict'; module.exports = angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("exampleBasic/exampleBasic.html","<div class=\'parent\'>\n    <h2>Example 1 - basics</h2>\n    <label for=\'hy\'>Move stuff between these two containers. Note how the stuff gets inserted near the mouse pointer? Great stuff.</label>\n    <div class=\'wrapper\' ng-controller=\"Example1\" ng-hide=\"true\">\n        <div class=\'container\'>\n            <div>Move me, but you can only drop me in one of these containers.</div>\n            <div>If you try to drop me somewhere other than these containers, I\'ll just come back.</div>\n            <div>Item 3.</div>\n            <div>Item 6.</div>\n        </div>\n        <div class=\'container\'>\n            <div>You can drop me in the left container, otherwise I\'ll stay here.</div>\n            <div>Item 4.</div>\n            <div>Item 5.</div>\n        </div>\n    </div>\n    <br/>\n    <div class=\'wrapper\' ng-controller=\"Example1model\">\n        <div class=\'tableRow\'>\n            <div class=\'container\'>\n                <div ng-repeat=\"item in items1\">{{item.content}}</div>\n            </div>\n            <div class=\'container\'>\n                <div ng-repeat=\"item in items2\">{{item.content}}</div>\n            </div>\n        </div>\n        <div class=\"tableRow\">\n            <div class=\"container\">\n                <div>Items1:\n                    <br/>{{items1 | json}}</div>\n            </div>\n            <div class=\"container\">\n                <div>Items2:\n                    <br/>{{items2 | json}}</div>\n            </div>\n        </div>\n    </div>\n    <pre>\n        <code>\n  dragularService([document.getElementById(left), document.getElementById(right)]);\n        </code>\n      </pre>\n</div>\n");
$templateCache.put("exampleBoundingBox/exampleBoundingBox.html","        <div class=\'parent\'>\n            <h2>Example 11 - boundingBox</h2>\n            <label for=\'hy\'>You can provide element in options.boundingBox to limit crossing element borders.</label>\n            <div class=\'wrapper\' ng-controller=\"Example11\">\n                <div class=\'container\'>\n                    <div>This items cannot cross its example element, just try it your selves.</div>\n                    <div>Item 2.</div>\n                    <div>Item 3.</div>\n                    <div>Item 6.</div>\n                </div>\n                <div class=\'container\'>\n                    <div>This items cannot cross its example element, just try it your selves.</div>\n                    <div>Item 4.</div>\n                    <div>Item 5.</div>\n                </div>\n            </div>\n            <pre>\n        <code>\n  dragularService([$element.children(), {\n    boundingBox: $element\n  });\n        </code>\n      </pre>\n        </div>");
$templateCache.put("exampleBoundingBoxLockY/exampleBoundingBoxLockY.html","        <div class=\'parent\'>\n            <h2>Example 12 - boundingBox and lockY</h2>\n            <label for=\'hy\'>Movement can be locked to X or Y axis and also you can provide element in options.boundingBox to limit crossing element borders.</label>\n            <div class=\'wrapper\' ng-controller=\"Example12\">\n                <div class=\'container\'>\n                    <div class=\'boundingBox\'>\n                        <div>Items are locked in Y axis movement and cannot cross its closest parent div.boundingBox, just try it your selves.</div>\n                        <div>item 2</div>\n                        <div>item 3</div>\n                        <div>item 4</div>\n                        <div>item 5</div>\n                        <div>item 6</div>\n                    </div>\n                </div>\n            </div>\n            <pre>\n        <code>\n  dragularService([$element.children()[0].children(), {\n    boundingBox: $element.children()[0],\n    lockY: true\n  });\n        </code>\n      </pre>\n        </div>");
$templateCache.put("exampleBoundingBoxLockX/exampleBoundingBoxLockX.html","<div class=\'parent\'>\n            <h2>Example 13 - boundingBox and lockX</h2>\n            <label for=\'hy\'>Movement can be locked to X or Y axis and also you can provide element in options.boundingBox to limit crossing element borders.</label>\n            <div class=\'wrapper\' ng-controller=\"Example13\">\n                <div class=\'containerHorizontal\'>\n                    <div class=\'boundingBox\'>\n                        <div class=\"width25\">Items are locked in X axis movement and cannot cross its closest parent div.boundingBox, just try it your selves.</div>\n                        <div class=\"width25\">item 2</div>\n                        <div class=\"width25\">item 3</div>\n                        <div class=\"width25\">item 4</div>\n                    </div>\n                </div>\n            </div>\n            <pre>\n        <code>\n  dragularService([$element.children()[0].children(), {\n    boundingBox: $element.children()[0],\n    lockX: true\n  });\n        </code>\n      </pre>\n        </div>");
$templateCache.put("exampleCopy/exampleCopy.html","<div class=\'parent\'>\n    <h2>Example 5 - copy</h2>\n    <label for=\'hy\'>Copying stuff is great too</label>\n    <div class=\'wrapper\' ng-controller=\"Example5\">\n        <div id=\'left2\' class=\'container\'>\n            <div>Move me, and make copy on drop.</div>\n            <div>If you try to drop me somewhere other than these containers, I\'ll just come back.</div>\n        </div>\n        <div id=\'right2\' class=\'container\'>\n            <div>You can drop me in the left container, otherwise I\'ll stay here.</div>\n        </div>\n    </div>\n    <pre>\n        <code>\n  dragularService([document.getElementById(left), document.getElementById(right)], { copy: true });\n        </code>\n      </pre>\n</div>\n");
$templateCache.put("exampleCustomClasses/exampleCustomClasses.html","<div class=\'parent\'>\n    <h2>Example 7 - custom classes</h2>\n    <label for=\'hy\'>You can overwrite buildin classes by providing classes names in object via options.classes.</label>\n    <div class=\'wrapper\' ng-controller=\"Example7\">\n        <div id=\'left4\' class=\'container\'>\n            <div>Move me, but you can only drop me in one of these containers.</div>\n            <div>If you try to drop me somewhere other than these containers, I\'ll just come back.</div>\n            <div>Item 3.</div>\n            <div>Item 6.</div>\n        </div>\n        <div id=\'right3\' class=\'container\'>\n            <div>You can drop me in the left container, otherwise I\'ll stay here.</div>\n            <div>Item 4.</div>\n            <div>Item 5.</div>\n        </div>\n    </div>\n    <pre>\n        <code>\n  dragularService([document.getElementById(left), document.getElementById(right)], { classes: {\n    mirror: \'custom-green-mirror\'\n  } });\n\n  // Default classes are:\n  option.classes = {\n    mirror: \'gu-mirror\',\n    hide: \'gu-hide\',\n    unselectable: \'gu-unselectable\',\n    transit: \'gu-transit\',\n    overActive: \'gu-over-active\',\n    overAccepts: \'gu-over-accept\',\n    overDeclines: \'gu-over-decline\'\n  };\n        </code>\n      </pre>\n</div>\n");
$templateCache.put("exampleDirective/exampleDirective.html","  <div class=\'parent\'>\n            <h2>Example 8 - directive</h2>\n            <label for=\'hy\'>Same as previous example, but using directive.</label>\n            <div class=\'wrapper\' ng-controller=\"Example8\">\n                <div id=\'left4\' class=\'container\' dragular=\"dragularOptions\">\n                    <div>Move me, but you can only drop me in one of these containers.</div>\n                    <div>If you try to drop me somewhere other than these containers, I\'ll just come back.</div>\n                    <div>Item 3.</div>\n                    <div>Item 6.</div>\n                </div>\n                <div id=\'right3\' class=\'container\' dragular=\'{\"classes\":{\"mirror\":\"custom-green-mirror\"},\"nameSpace\":\"common\"}\'>\n                    <div>You can drop me in the left container, otherwise I\'ll stay here.</div>\n                    <div>Item 4.</div>\n                    <div>Item 5.</div>\n                </div>\n            </div>\n            <pre>\n        <code>\n  &lt;div class=\'container\' dragular=&quot;dragularOptions&quot;&gt;\n\n  $scope.dragularOptions = {\n    classes: {\n      mirror: \'custom-green-mirror\'\n    },\n    nameSpace: \'common\' // just connecting left and right container\n  };\n&lt;div class=\'container\' dragular=\'{&quot;classes&quot;:{&quot;mirror&quot;:&quot;custom-green-mirror&quot;},&quot;nameSpace&quot;:&quot;common&quot;}\'&gt;\n      </code>\n    </pre>\n        </div>");
$templateCache.put("exampleDragOverClasses/exampleDragOverClasses.html","       <div class=\'parent\'>\n            <h2>Example 10 - dragOverClasses</h2>\n            <label for=\'hy\'>You can interact with dragging element by setting dragOverClasses:true in options and adding pointer class (default is: \'gu-over-active\') to element you want to be interactive (getting classes). Usually you want to containers show wheather they accepts element or not, but you can use it anywhere. Try to drag over the example code too.</label>\n            <div class=\'wrapper\' ng-controller=\"Example10\">\n                <div class=\'container width25 gu-over-active\'>\n                    <div>apples and oranges cannot be mixed</div>\n                    <div>apple 2</div>\n                    <div>apple 3</div>\n                    <div>apple 4</div>\n                </div>\n                <div class=\'container width25 gu-over-active\'>\n                    <div>orange 1</div>\n                    <div>orange 2</div>\n                    <div>orange 3</div>\n                    <div>orange 4</div>\n                </div>\n                <div class=\'container width25 gu-over-active\'>\n                    <div>apple 5</div>\n                    <div>apple 6</div>\n                    <div>apple 7</div>\n                    <div>apple 8</div>\n                </div>\n                <div class=\'container width25 gu-over-active\'>\n                    <div>orange 5</div>\n                    <div>orange 6</div>\n                    <div>orange 7</div>\n                    <div>orange 8</div>\n                </div>\n            </div>\n            <pre class=\"gu-over-active\">\n        <code>\n  dragularService([$element.children()[0], $element.children()[2]], {\n    nameSpace: \'apples\',\n    dragOverClasses: true\n  });\n  dragularService([$element.children()[1], $element.children()[3]], {\n    nameSpace: \'oranges\',\n    dragOverClasses: true\n  });\n\n  .container.gu-over-active.gu-over-accept {\n    background-color: green;\n  }\n\n  .container.gu-over-active.gu-over-decline {\n    background-color: red;\n  }\n\n  code.gu-over-active.gu-over-decline {\n    background-color: yellow;\n  }\n        </code>\n      </pre>\n        </div>");
$templateCache.put("exampleEvents/exampleEvents.html","<div class=\'parent\'>\n    <h2>Example 2 - events</h2>\n    <label for=\'hy\'>Add some fantastic events!</label>\n    <div class=\'wrapper\' ng-controller=\"Example2\">\n        <div id=\'left3\' class=\'container\'>\n            <div>Move me, but you can only drop me in one of these containers.</div>\n            <div>If you try to drop me somewhere other than these containers, I\'ll just come back.</div>\n            <div>Item 3.</div>\n            <div>Item 6.</div>\n        </div>\n        <div id=\'right3\' class=\'container\'>\n            <div>You can drop me in the left container, otherwise I\'ll stay here.</div>\n            <div>Item 4.</div>\n            <div>Item 5.</div>\n        </div>\n    </div>\n    <pre>\n        <code>\n  dragularService([document.getElementById(left), document.getElementById(right)], {\n    scope: $scope\n  });\n  $scope.$on(\'drag\', function(e, el) {\n    e.stopPropagation();\n    el.className = el.className.replace(\' ex-moved\', \'\');\n  });\n  $scope.$on(\'drop\', function(e, el) {\n    e.stopPropagation();\n    $timeout(function() {\n      el.className += \' ex-moved\';\n    }, 0);\n  });\n        </code>\n      </pre>\n</div>\n");
$templateCache.put("exampleHandle/exampleHandle.html","<div class=\'parent\'>\n    <h2>Example 6 - handle</h2>\n    <label for=\'hy\'>Drag handles float your cruise?</label>\n    <div class=\'wrapper\' ng-controller=\"Example6\">\n        <div id=\'left5\' class=\'container\'>\n            <div><span class=\'handle\'>+</span>Move me, but you can use the plus sign to drag me around.</div>\n        </div>\n        <div id=\'right5\' class=\'container\'>\n        </div>\n    </div>\n    <pre>\n        <code>\n  dragularService([document.getElementById(left), document.getElementById(right)], {\n    moves: function (el, container, handle) {\n      return handle.className === \'handle\';\n    }\n  });\n        </code>\n      </pre>\n</div>\n");
$templateCache.put("exampleNameSpaces/exampleNameSpaces.html","        <div class=\'parent\'>\n            <h2>Example 9 - namespaces</h2>\n            <label for=\'hy\'>Try to mix apples and oranges. You cannot place apples into oranges, but notice that you can place it into mixed. Mixed can be placed into apples and oranges. Notice that mixed becomes orange or apple if placed into their container. <b>So remember if you are using namespacing, then item is namespaced according to actual container it is placed in. If you need to item preserve thier state you need to use classes in combination with options.accepts and optionally options.isContainer.</b> It depends on setup. (See <a href=\"https://github.com/luckylooke/dragular/issues/9\">issue #9</a>.)</label>\n            <div class=\'wrapper\' ng-controller=\"Example9\">\n                <div class=\'container width25\'>\n                    <div>try to mix oranges and apples</div>\n                    <div>apple 2</div>\n                    <div>apple 3</div>\n                    <div>apple 4</div>\n                </div>\n                <div class=\'container width25\'>\n                    <div>orange 1</div>\n                    <div>orange 2</div>\n                    <div>orange 3</div>\n                    <div>orange 4</div>\n                </div>\n                <div class=\'container width25\'>\n                    <div>apple 5</div>\n                    <div>apple 6</div>\n                    <div>apple 7</div>\n                    <div>apple 8</div>\n                </div>\n                <div class=\'container width25\'>\n                    <div>mixed 1</div>\n                    <div>mixed 2</div>\n                    <div>mixed 3</div>\n                    <div>mixed 4</div>\n                </div>\n            </div>\n            <pre>\n      <code>\ndragularService([$element.children()[0], $element.children()[2]], {\n  nameSpace: \'apples\'\n});\ndragularService($element.children()[1], {\n  nameSpace: \'oranges\'\n});\ndragularService($element.children()[3], { // mixed\n  nameSpace: [\'oranges\', \'apples\']\n});\n      </code>\n    </pre>\n        </div>");
$templateCache.put("exampleNestedNgRepeat/exampleNestedNgRepeat.html","<div class=\'parent\'>\n    <h2>Example 15 - nested ngRepeat (advanced)</h2>\n    <label for=\'hy\'> You can move whole rows by grabing row title, all items it selves. Try it out!\n        <hr/>\n        <b>Old IE doesnt support Flexible Box Layout</b> so it can look weird. But in modern browsers it is awsome! Dragular will be working well also in old IE but you have to use different css for layout.\n        <hr/>\n    </label>\n    <div ng-controller=\"Example15\">\n        <div ng-repeat=\"item in items\" class=\'row\'>\n            <div class=\"row-handle\">Row {{$index}}</div>\n            <div ng-repeat=\"item in item.items\" class=\"cell\">{{item.content}}</div>\n        </div>\n    </div>\n    <pre>\n        <code>\n  // HTML\n\n  &lt;div ng-controller=&quot;Example15&quot;&gt;\n    &lt;div ng-repeat=&quot;item in items&quot; class=\'row\'&gt;\n      &lt;div class=&quot;row-handle&quot;&gt;Row {{$index}}&lt;/div&gt;\n      &lt;div ng-repeat=&quot;item in item.items&quot; class=&quot;cell&quot;&gt;{{item.content}}&lt;/div&gt;\n    &lt;/div&gt;\n  &lt;/div&gt;\n        </code>\n      </pre>\n    <pre>\n        <code>\n  // CSS\n\n  .row {\n    display: flex;\n    flex-direction: row;\n  }\n\n  .cell {\n    flex-grow: 1;\n  }\n\n  .row,\n  .cell {\n    margin: 10px;\n    padding: 10px;\n    background-color: rgba(0, 0, 0, 0.2);\n  }\n        </code>\n      </pre>\n    <pre>\n        <code>\n  // JS\n\n  $timeout(function() { // timeount due to ngRepeat to be ready\n    dragularService($element, {\n      moves: function(el, container, handle) {\n        return handle.classList.contains(\'row-handle\');\n      }\n    });\n    dragularService($element.children(), {\n      moves: function(el, container, handle) {\n        return !handle.classList.contains(\'row-handle\');\n      }\n    });\n  }, 0);\n  $scope.items = [{\n    items: [{\n      content: \'Item a1\'\n    }, {\n      content: \'Item a2\'\n    }, {\n      content: \'Item a3\'\n    }, {\n      content: \'Item a4\'\n    }]\n  }, {\n    items: [{\n      content: \'Item b1\'\n    }, {\n      content: \'Item b2\'\n    }, {\n      content: \'Item b3\'\n    }, {\n      content: \'Item b4\'\n    }]\n  }, {\n    items: [{\n      content: \'Item c1\'\n    }, {\n      content: \'Item c2\'\n    }, {\n      content: \'Item c3\'\n    }, {\n      content: \'Item c4\'\n    }]\n  }];\n        </code>\n      </pre>\n</div>\n");
$templateCache.put("exampleNgRepeat/exampleNgRepeat.html","        <div class=\'parent\'>\n            <h2>Example 14 - ngRepeat</h2>\n            <label for=\'hy\'>Example of using ng-repeat with dragular and adding/removing items dynamicaly.</label>\n            <div class=\'wrapper\' ng-controller=\"Example14\">\n                <div class=\'container\'>\n                    <div ng-repeat=\"item in items\">\n                        {{item.content}}\n                        <button class=\'cursorDefault\' ng-click=\"addItem()\">+</button>\n                        <button class=\'cursorDefault\' ng-click=\"removeItem()\">x</button>\n                    </div>\n                </div>\n            </div>\n            <pre>\n        <code>\n  // HTML:\n  &lt;div class=\'container\'&gt;\n    &lt;div ng-repeat=&quot;item in items&quot;&gt;\n      {{item.content}}\n      &lt;button class=\'cursorDefault\' ng-click=&quot;addItem()&quot;&gt;+&lt;/button&gt;\n      &lt;button class=\'cursorDefault\' ng-click=&quot;removeItem()&quot;&gt;x&lt;/button&gt;\n    &lt;/div&gt;\n  &lt;/div&gt;\n\n  // JS:\n  dragularService($element.children());\n  $scope.items = [{\n    content: \'Try to add or remove some elements (click on +- buttons), you will see that it is not problem for dragular.\'\n  },{\n    content: \'Item 2\'\n  },{\n    content: \'Item 3\'\n  },{\n    content: \'Item 4\'\n  }];\n  $scope.addItem = function addItem () {\n    var index = $scope.items.indexOf(this.item) + 1;\n    $scope.items.splice(index, 0,{content: this.item.content + \'-copy\'});\n  }\n  $scope.removeItem = function removeItem () {\n    var index = $scope.items.indexOf(this.item);\n    $scope.items.splice(index, 1);\n  }\n        </code>\n      </pre>\n        </div>\n");
$templateCache.put("exampleRemoveOnSpill/exampleRemoveOnSpill.html","        <div class=\'parent\'>\n            <h2>Example 3 - remove on spill</h2>\n            <label for=\'hy\'>Need to be able to quickly delete stuff when it spills out of the chosen containers?</label>\n            <div class=\'wrapper\' ng-controller=\"Example3\">\n                <div id=\'single1\' class=\'container\'>\n                    <div>Move me, but you can only drop me somewhere in this container.</div>\n                    <div>If you try to drop me somewhere other than here, I\'ll die a fiery death.</div>\n                    <div>Item 3.</div>\n                    <div>Item 6.</div>\n                    <div>Item 4.</div>\n                    <div>Item 5.</div>\n                </div>\n            </div>\n            <pre>\n        <code>\n  dragularService([document.getElementById(single)], { removeOnSpill: true });\n        </code>\n      </pre>\n        </div>");
$templateCache.put("exampleRevertOnSpill/exampleRevertOnSpill.html","        <div class=\'parent\'>\n            <h2>Example 4 - revert on spill</h2>\n            <label for=\'hy\'>By default, dropping an element outside of any known containers will keep the element in the last place it hovered over. You can make elements go back home if they\'re dropped outside of known containers, too.</label>\n            <div class=\'wrapper\' ng-controller=\"Example4\">\n                <div id=\'left4\' class=\'container\'>\n                    <div>Move me, but you can only drop me in one of these containers.</div>\n                    <div>If you try to drop me somewhere other than these containers, I\'ll just come back.</div>\n                    <div>Item 3.</div>\n                    <div>Item 6.</div>\n                </div>\n                <div id=\'right4\' class=\'container\'>\n                    <div>You can drop me in the left container, otherwise I\'ll stay here.</div>\n                    <div>Item 4.</div>\n                    <div>Item 5.</div>\n                </div>\n            </div>\n            <pre>\n        <code>\n  dragularService([document.getElementById(left), document.getElementById(right)], { revertOnSpill: true });\n        </code>\n      </pre>\n        </div>");
$templateCache.put("exampleScrollingDrag/exampleScrollingDrag.html","<div class=\'parent\'>\n    <h2>Example 16 - scrolling drag</h2>\n    <label for=\'hy\'> Containre can be scrolled by hovering dragged item over most top visible item or most bottom, scroll direction respectively.\n    </label>\n    <div ng-controller=\"Example16\">\n        <div class=\"container heightLimit\">\n            <div>Item 1</div>\n            <div>Item 2</div>\n            <div>Item 3.</div>\n            <div>Item 4.</div>\n            <div>Item 5.</div>\n            <div>Item 6.</div>\n            <div>Item 7.</div>\n            <div>Item 9.</div>\n            <div>Item 10.</div>\n            <div>Item 11.</div>\n            <div>Item 12.</div>\n            <div>Item 13.</div>\n        </div>\n    </div>\n</div>\n");}]);
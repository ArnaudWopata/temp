var app;

app = angular.module("app", []);

app.directive('editor', function($compile) {
  var insertTextAtCursor;
  insertTextAtCursor = function(el, text) {
    var endIndex, range, val;
    val = el.value;
    endIndex = void 0;
    range = void 0;
    if (typeof el.selectionStart !== "undefined" && typeof el.selectionEnd !== "undefined") {
      endIndex = el.selectionEnd;
      el.value = val.slice(0, endIndex) + text + val.slice(endIndex);
      return el.selectionStart = el.selectionEnd = endIndex + text.length;
    } else if (typeof document.selection !== "undefined" && typeof document.selection.createRange !== "undefined") {
      el.focus();
      range = document.selection.createRange();
      range.collapse(false);
      range.text = text;
      return range.select();
    }
  };
  return {
    replace: true,
    restrict: 'E',
    templateUrl: "/templates/editor.html",
    link: function(scope, element, attrs) {
      scope.container = element;
      return angular.element(element).append(scope.generateTextBlock);
    },
    controller: function($scope) {
      $scope.generateTextBlock = function(element) {
        var el, textblock;
        textblock = angular.element(document.createElement('textblock'));
        el = $compile(textblock)($scope);
        return textblock;
      };
      $scope.$on('goNextTextBlock', function(event, options) {
        var newTextBlock, previous;
        previous = options.element;
        console.log('goNextTextBlock', previous, options.textToAppend);
        newTextBlock = $scope.generateTextBlock();
        angular.element(previous).after(newTextBlock);
        $scope.$apply();
        newTextBlock.val(options.textToAppend);
        newTextBlock.focus();
        return $(newTextBlock).selectRange(0);
      });
      return $scope.$on('destroyTextBlock', function(event, options) {
        var cursorPos, element, previousTextBlock, textToAppend;
        element = options.element;
        textToAppend = options.textToAppend;
        if ($($scope.container).children().length > 1) {
          previousTextBlock = $(element).prev()[0];
          previousTextBlock.focus();
          element.detach();
          cursorPos = $(previousTextBlock).getCursorPosition();
          insertTextAtCursor(previousTextBlock, textToAppend);
          return $(previousTextBlock).selectRange(cursorPos);
        }
      });
    }
  };
});

app.directive('textblock', function() {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: "/templates/textblock.html",
    link: function(scope, element, attrs) {
      return $(element).keydown(function(e) {
        var $element, currentElementNewText, cursorPos, position, text, textToAppend;
        if (e.which === 13) {
          console.log('Pressed enter');
          $element = $(element);
          cursorPos = $element.getCursorPosition();
          text = $element.val();
          textToAppend = text.split('').splice(cursorPos).join('');
          currentElementNewText = text.split('').splice(0, cursorPos).join('');
          $element.val(currentElementNewText);
          scope.$emit('goNextTextBlock', {
            element: element,
            textToAppend: textToAppend
          });
          return false;
        }
        if (e.which === 8) {
          console.log('Pressed del');
          position = $(element).getCursorPosition();
          if (position === 0) {
            scope.$emit('destroyTextBlock', {
              element: element,
              textToAppend: $(element).val()
            });
            return false;
          }
        }
      });
    }
  };
});

(function($, undefined_) {
  $.fn.getCursorPosition = function() {
    var Sel, SelLength, el, pos;
    el = $(this).get(0);
    pos = 0;
    if ("selectionStart" in el) {
      pos = el.selectionStart;
    } else if ("selection" in document) {
      el.focus();
      Sel = document.selection.createRange();
      SelLength = document.selection.createRange().text.length;
      Sel.moveStart("character", -el.value.length);
      pos = Sel.text.length - SelLength;
    }
    return pos;
  };
  return $.fn.selectRange = function(start, end) {
    if (!end) {
      end = start;
    }
    return this.each(function() {
      var range;
      if (this.setSelectionRange) {
        this.focus();
        return this.setSelectionRange(start, end);
      } else if (this.createTextRange) {
        range = this.createTextRange();
        range.collapse(true);
        range.moveEnd("character", end);
        range.moveStart("character", start);
        return range.select();
      }
    });
  };
})(jQuery);

var JSONDocCtrl, server_url;

server_url = 'http://grp-rt-staging.herokuapp.com/channel';

JSONDocCtrl = function($scope, $element) {
  var closeCurrentDocument, connectDoc;
  $scope.docname = 'default_json';
  $scope.added_value = 'foo';
  $scope.raw_json = 'waiting...';
  $scope.connection = new sharejs.Connection(server_url);
  $scope.current_doc = null;
  $scope.openDocument = function() {
    return closeCurrentDocument(function() {
      return connectDoc($scope.docname, function(error, doc) {
        $scope.current_doc = doc;
        if (!doc.get()) {
          doc.set({
            content: []
          });
        }
        doc.on('change', function(arg1, arg2) {
          console.log(arg1, arg2);
          return $scope.refresh();
        });
        return doc.on('remoteop', function() {
          return $scope.$apply(function() {
            return $scope.refresh();
          });
        });
      });
    });
  };
  connectDoc = function(docname, callback) {
    console.log('opening document:', $scope.docname);
    return $scope.connection.open(docname, 'json', callback);
  };
  closeCurrentDocument = function(callback) {
    var doc;
    console.log('closing current document');
    doc = $scope.current_doc;
    if (doc) {
      return doc.close(callback);
    } else {
      return callback();
    }
  };
  $scope.appendValue = function() {
    var content, doc;
    doc = $scope.current_doc;
    content = doc.at('content');
    return content.push($scope.added_value);
  };
  $scope.reset = function() {
    var content, doc;
    doc = $scope.current_doc;
    content = doc.at('content');
    return content.set([]);
  };
  $scope.refresh = function() {
    var doc;
    console.log('refreshing');
    doc = $scope.current_doc;
    if (doc) {
      return $scope.raw_json = doc.snapshot;
    }
  };
  return $scope.openDocument();
};

var DocumentCtrl, server_url;

server_url = 'http://grp-rt-staging.herokuapp.com/channel';

DocumentCtrl = function($scope, $element) {
  var closeCurrentDocument, connectDoc;
  $scope.docname = 'default_doc';
  $scope.editors = $('.editor', $element);
  $scope.connection = new sharejs.Connection(server_url);
  connectDoc = function(docname, callback) {
    console.log('opening document:', $scope.docname);
    return $scope.connection.open(docname, 'text', callback);
  };
  closeCurrentDocument = function(callback) {
    var doc;
    console.log('closing current document');
    doc = $scope.current_doc;
    if (doc) {
      $scope.editors.each(function(index, element) {
        return element.detach_share();
      });
      return doc.close(callback);
    } else {
      return callback();
    }
  };
  return $scope.openDocument = function() {
    return closeCurrentDocument(function() {
      return connectDoc($scope.docname, function(error, doc) {
        $scope.current_doc = doc;
        return $scope.editors.each(function(index, element) {
          $(this).html = doc.snapshot;
          return doc.attach_textarea(element);
        });
      });
    });
  };
};

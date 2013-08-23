var app;

app = angular.module("app", []);

app.directive('editor', function($compile) {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: "/templates/editor.html",
    link: function(scope, element, attrs) {
      scope.container = element;
      return angular.element(element).append(scope.generateTextBlock);
    },
    controller: function($scope) {
      var mergeTextBlock;
      $scope.generateTextBlock = function(element) {
        var textblock;
        textblock = angular.element(document.createElement('textblock'));
        $compile(textblock)($scope);
        return textblock;
      };
      $scope.$on('createNewTextBlock', function(event, source) {
        var $destination, $source, destination, sourceSelection, textToAppend;
        $source = $(source);
        sourceSelection = $source.getSelection();
        if (sourceSelection.start === 0) {
          return;
        }
        destination = $scope.generateTextBlock();
        $source.after(destination);
        $scope.$apply();
        $destination = $(destination);
        $source.setSelection(sourceSelection.start, $source.val().length);
        textToAppend = $source.extractSelectedText();
        $destination.insertText(textToAppend, 0);
        $destination.setSelection(0);
        return destination.focus();
      });
      $scope.$on('mergeInPreviousTextBlock', function(event, source) {
        var $source, destination;
        $source = $(source);
        destination = $source.prev('textarea')[0];
        if (!destination) {
          return;
        }
        return mergeTextBlock($source, $(destination));
      });
      $scope.$on('mergeNextTextBlock', function(event, destination) {
        var $destination, $source;
        $destination = $(destination);
        $source = $destination.next('textarea').first();
        if (!$source) {
          return;
        }
        return mergeTextBlock($source, $destination);
      });
      return mergeTextBlock = function($source, $destination) {
        var destination, endBeforeInsert, source, textToAppend;
        source = $source.get(0);
        destination = $destination.get(0);
        textToAppend = $source.val();
        destination.focus();
        endBeforeInsert = $destination.val().length;
        $destination.insertText(textToAppend, endBeforeInsert);
        $destination.setSelection(endBeforeInsert);
        return $source.detach();
      };
    }
  };
});

app.directive('textblock', function() {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: "/templates/textblock.html",
    link: function(scope, element, attrs) {
      var $el;
      $el = $(element);
      return $el.keydown(function(e) {
        var selection;
        if (e.which === 13) {
          scope.$emit('createNewTextBlock', element);
          return false;
        }
        if (e.which === 8) {
          selection = $el.getSelection();
          if (selection.start === 0 && selection.end === 0) {
            scope.$emit('mergeInPreviousTextBlock', element);
            return false;
          }
        }
        if (e.which === 46) {
          selection = $el.getSelection();
          if (selection.end === $el.val().length) {
            scope.$emit('mergeNextTextBlock', element);
            return false;
          }
        }
      });
    }
  };
});

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

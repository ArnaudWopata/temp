server_url = 'http://grp-rt-staging.herokuapp.com/channel'

DocumentCtrl = ($scope, $element) ->
  $scope.docname = 'default_doc'
  $scope.editors = $('.editor', $element)
  $scope.connection = new sharejs.Connection server_url

  connectDoc = (docname, callback) ->
    console.log 'opening document:', $scope.docname
    $scope.connection.open docname, 'text', callback

  closeCurrentDocument = (callback) ->
    console.log 'closing current document'
    doc = $scope.current_doc
    if doc
      $scope.editors.each (index, element)->
        element.detach_share()
      doc.close callback
    else
      callback()

  $scope.openDocument = () ->
    closeCurrentDocument ->
      connectDoc $scope.docname, (error, doc) ->
        $scope.current_doc = doc
        $scope.editors.each (index, element) ->
          $(this).html = doc.snapshot
          doc.attach_textarea element

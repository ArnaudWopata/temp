server_url = 'http://grp-rt-staging.herokuapp.com/channel'

JSONDocCtrl = ($scope, $element) ->
  $scope.docname = 'default_json'
  $scope.added_value = 'foo'
  $scope.raw_json = 'waiting...'
  $scope.connection = new sharejs.Connection server_url
  $scope.current_doc = null

  $scope.openDocument = () ->
    closeCurrentDocument ->
      connectDoc $scope.docname, (error, doc) ->
        $scope.current_doc = doc
        unless doc.get()
          doc.set
            content:[]
        doc.on 'change', (arg1, arg2) ->
          console.log arg1, arg2
          $scope.refresh()
        doc.on 'remoteop', () ->
          $scope.$apply ()->
            $scope.refresh()


  connectDoc = (docname, callback) ->
    console.log 'opening document:', $scope.docname
    $scope.connection.open docname, 'json', callback

  closeCurrentDocument = (callback) ->
    console.log 'closing current document'
    doc = $scope.current_doc
    if doc
      doc.close callback
    else
      callback()

  $scope.appendValue = () ->
    doc = $scope.current_doc
    content = doc.at 'content'
    content.push $scope.added_value

  $scope.reset = () ->
    doc = $scope.current_doc
    content = doc.at 'content'
    content.set []

  $scope.refresh = () ->
    console.log 'refreshing'
    doc = $scope.current_doc
    $scope.raw_json = doc.snapshot if doc


  $scope.openDocument()

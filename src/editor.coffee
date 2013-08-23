app = angular.module("app", [])

app.directive 'editor', ($compile)->
  {

    replace: true
    restrict: 'E'
    templateUrl: "/templates/editor.html"

    link: (scope, element, attrs)->
      # Create the first text block, for free :)
      scope.container = element
      angular.element(element).append scope.generateTextBlock

    controller: ($scope)->
      $scope.generateTextBlock = (element)->
        textblock = angular.element(document.createElement 'textblock')
        $compile(textblock)($scope)
        textblock

      $scope.$on 'createNewTextBlock', (event, source)->
        $source = $(source)
        sourceSelection = $source.getSelection()

        # do nothing if the source would be left empty
        return if sourceSelection.start is 0

        # Create the block and insert it
        destination = $scope.generateTextBlock()
        $source.after destination
        $scope.$apply()
        $destination = $(destination) # Cache this

        # Extract the remaining text form the source block
        $source.setSelection(sourceSelection.start, $source.val().length)
        textToAppend = $source.extractSelectedText()

        # Insert it into the newly created text block
        # And set focus at the start
        $destination.insertText textToAppend, 0
        $destination.setSelection(0)
        destination.focus()

      $scope.$on 'mergeInPreviousTextBlock', (event, source)->
        $source = $ source
        destination = $source.prev('textarea')[0] # We should to target a class
        # don't do anything if it's the very first textblock
        return unless destination

        mergeTextBlock $source, $(destination)

      $scope.$on 'mergeNextTextBlock', (event, destination)->
        $destination = $ destination
        $source = $destination.next('textarea').first() # We should to target a class
        return unless $source # do nothing if it's the last textblock
        mergeTextBlock $source, $destination

      mergeTextBlock = ($source, $destination)->
        source = $source.get(0)
        destination = $destination.get(0)

        textToAppend = $source.val()
        destination.focus()

        # Insert the text and cursor
        endBeforeInsert = $destination.val().length
        $destination.insertText textToAppend, endBeforeInsert
        $destination.setSelection endBeforeInsert

        # Remove source
        $source.detach()

  }

# HOW TO
# Manually trigger keydown
# ev = document.createEvent('KeyboardEvent')
# ev.initKeyboardEvent("keydown", true, true)
# el.dispatchEvent(ev)

app.directive 'textblock', ->
  {
    replace: true
    restrict: 'E'
    templateUrl: "/templates/textblock.html"
    link: (scope, element, attrs)->
      $el = $(element)

      $el.keydown (e)->
        if e.which is 13 # ENTER
          scope.$emit 'createNewTextBlock', element
          return false # prevent /n to be added
        if e.which is 8 # BACKSPACE
          selection = $el.getSelection()
          if selection.start is 0 and selection.end is 0 #allow deleting of selection
            scope.$emit 'mergeInPreviousTextBlock', element
            return false # prevent deleting in previous textarea. Weird
        if e.which is 46 # DEL
          selection = $el.getSelection()
          if selection.end is $el.val().length # do this only when at the end
            scope.$emit 'mergeNextTextBlock', element
            return false
  }






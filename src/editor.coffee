app = angular.module("app", [])

app.directive 'editor', ($compile)->

  insertTextAtCursor = (el, text) ->
    val = el.value
    endIndex = undefined
    range = undefined
    if typeof el.selectionStart isnt "undefined" and typeof el.selectionEnd isnt "undefined"
      endIndex = el.selectionEnd
      el.value = val.slice(0, endIndex) + text + val.slice(endIndex)
      el.selectionStart = el.selectionEnd = endIndex + text.length
    else if typeof document.selection isnt "undefined" and typeof document.selection.createRange isnt "undefined"
      el.focus()
      range = document.selection.createRange()
      range.collapse false
      range.text = text
      range.select()

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
        el = $compile(textblock)($scope)
        textblock

      $scope.$on 'goNextTextBlock', (event, options)->
        previous = options.element
        console.log 'goNextTextBlock', previous, options.textToAppend
        newTextBlock = $scope.generateTextBlock()
        angular.element(previous).after newTextBlock
        $scope.$apply()
        newTextBlock.val(options.textToAppend)
        newTextBlock.focus()
        $(newTextBlock).selectRange(0)


      $scope.$on 'destroyTextBlock', (event, options)->
        element = options.element
        textToAppend = options.textToAppend
        if $($scope.container).children().length > 1
          previousTextBlock = $(element).prev()[0]
          previousTextBlock.focus()
          element.detach()
          cursorPos = $(previousTextBlock).getCursorPosition()
          insertTextAtCursor previousTextBlock, textToAppend
          $(previousTextBlock).selectRange(cursorPos)

          # Manually trigger keydown
          # ev = document.createEvent('KeyboardEvent')
          # ev.initKeyboardEvent("keydown", true, true)
          # el.dispatchEvent(ev)

  }

app.directive 'textblock', ->
  {
    replace: true
    restrict: 'E'
    templateUrl: "/templates/textblock.html"
    link: (scope, element, attrs)->
      $(element).keydown (e)->
        if e.which == 13
          console.log 'Pressed enter'
          $element = $(element)
          cursorPos = $element.getCursorPosition()
          text = $element.val()

          # Save the text after carret
          textToAppend = text.split('').splice(cursorPos).join('')

          # Remove the text after carret
          currentElementNewText = text.split('').splice(0, cursorPos).join('')
          $element.val(currentElementNewText)

          scope.$emit 'goNextTextBlock',
            element: element,
            textToAppend: textToAppend

          return false # prevent /n to be added
        if e.which == 8
          console.log 'Pressed del'
          position = $(element).getCursorPosition()
          if position == 0
            scope.$emit 'destroyTextBlock',
              element: element,
              textToAppend: $(element).val()
            return false
  }

(($, undefined_) ->
  $.fn.getCursorPosition = ->
    el = $(this).get(0)
    pos = 0
    if "selectionStart" of el
      pos = el.selectionStart
    else if "selection" of document
      el.focus()
      Sel = document.selection.createRange()
      SelLength = document.selection.createRange().text.length
      Sel.moveStart "character", -el.value.length
      pos = Sel.text.length - SelLength
    pos

  $.fn.selectRange = (start, end) ->
    end = start  unless end
    @each ->
      if @setSelectionRange
        @focus()
        @setSelectionRange start, end
      else if @createTextRange
        range = @createTextRange()
        range.collapse true
        range.moveEnd "character", end
        range.moveStart "character", start
        range.select()
) jQuery






goog.exportPath_('com.nerdwin15.stash.webhook');


com.nerdwin15.stash.webhook.eventSelector = function(options){
    
    var value = options.value === undefined ? "" : options.value ,
        internalOptions = {
        eventTypes : [
            {
                eventClass: "com.atlassian.bitbucket.event.pull.PullRequestOpenedEvent",
                eventName: AJS.I18n.getText('stash.webhook.repo.event.pull.request.opened.name'),
                eventTitle: AJS.I18n.getText('stash.webhook.repo.event.pull.request.opened.title')
            },{
                eventClass: "com.atlassian.bitbucket.event.pull.PullRequestReopenedEvent",
                eventName: AJS.I18n.getText('stash.webhook.repo.event.pull.request.reopened.name'),
                eventTitle: AJS.I18n.getText('stash.webhook.repo.event.pull.request.reopened.title')
            },{
                eventClass: "com.atlassian.bitbucket.event.pull.PullRequestMergedEvent",
                eventName: AJS.I18n.getText('stash.webhook.repo.event.pull.request.merged.name'),
                eventTitle: AJS.I18n.getText('stash.webhook.repo.event.pull.request.merged.title')
            },{
                eventClass: "com.atlassian.bitbucket.event.repository.RepositoryRefsChangedEvent",
                eventName: AJS.I18n.getText('stash.webhook.repo.event.repository.refs.changed.name'),
                eventTitle: AJS.I18n.getText('stash.webhook.repo.event.repository.refs.changed.title')
            }
        ]
    }
    _.each(internalOptions.eventTypes, function(option){
        option.selected = (value.indexOf(option.eventClass) !== -1);
    });
    
    internalOptions.value = value;
    
    return com.nerdwin15.stash.webhook.eventSelectorInternal(internalOptions);
}
define('plugin/jenkins/settings-event-selector', [
    'jquery',
    'underscore'
], function ($, _) {
   function EventSelector(){
       
   } 
   _.extend(EventSelector.prototype, {
      init: function(){
      },
      onChange : function($lozenge){
        var $hidden = $('.event-selector input'),
            events = $hidden.val() ? $hidden.val().split(',') : [],
            selection = $lozenge.data('event-class');
    
        if ($lozenge.is(".aui-lozenge-error")){
            $lozenge.removeClass("aui-lozenge-error");
            $lozenge.addClass("aui-lozenge-subtle")
            var position = events.indexOf(selection);
            events.splice(position, 1);
        } else {
            $lozenge.addClass("aui-lozenge-error");
            $lozenge.removeClass("aui-lozenge-subtle")
            events.push(selection);
        }
        
        $hidden.val(events.join(','));
      }
   });
   return EventSelector;
});
AJS.$(function(){
    AJS.$.ajax({
        url : AJS.contextPath() + "/rest/jenkins/latest/license",
    }).done(function(response){
        if (!response.licensed) {
            AJS.flag({
               type: 'error',
               title: AJS.I18n.getText('stash.webhook.license.error.title'),
               body: AJS.I18n.getText('stash.webhook.license.error.body')
           });
        }
        
    });
});
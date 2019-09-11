goog.exportPath_('com.nerdwin15.stash.webhook');

com.nerdwin15.stash.webhook.renderInstances = function (options) {
    function matchProperty(prop){
        var  found = prop.match(/(\d+)$/);
        if (found){
            var v = parseInt(found[0]);
            if (v > maxInstance){
                maxInstance = v;
            }
        }
    }
    var html = [];
    
    var maxInstance = 0;
    
    //iterate over both config & errors (as errors can contain references to new (not persisted) events)
    for (var prop in options.config) {
        if (prop.indexOf('jenkinsBase') === 0){
            matchProperty(prop);
        }
    }    
    for (var prop in options.errors) {
        matchProperty(prop);
    }    

    if (options.config['jenkinsBase'] || AJS.$('input#jenkinsBase').length || maxInstance === 0) {
        html.push(
            com.nerdwin15.stash.webhook.instanceFields({
                jenkinsBaseName : 'jenkinsBase',
                jenkinsBaseValue: options.config['jenkinsBase'],
                jenkinsBaseError : (options.errors && options.errors['jenkinsBase']) ? options.errors['jenkinsBase'][0] : undefined,
                cloneTypeName: 'cloneType',
                cloneTypeValue: options.config['cloneType'],
                cloneTypeError: (options.errors && options.errors['cloneType']) ? options.errors['cloneType'][0] : undefined,
                cloneUrlName: 'gitRepoUrl',
                cloneUrlValue: options.config['gitRepoUrl'],
                cloneUrlError: (options.errors && options.errors['gitRepoUrl']) ? options.errors['gitRepoUrl'][0] : undefined,
                jenkinsEndPointTypeName : 'jenkinsEndPointType',
                jenkinsEndPointTypeValue : options.config['jenkinsEndPointType'],
                mirrorServerIdName : "mirrorServerId",
                mirrorServerIdValue : options.config['mirrorServerId'],
                mirrorCloneUrlName : "mirrorCloneUrl",
                mirrorCloneUrlValue : options.config['mirrorCloneUrl'],
                scope : options.scope
            })
        );
    }
    
    
    for (var i = 2; i <= maxInstance; i++ ){
        if (options.config['jenkinsBase' + i] || AJS.$('input#jenkinsBase' + i).length) {
            html.push(
                        com.nerdwin15.stash.webhook.instanceFields({
                            jenkinsBaseName : 'jenkinsBase' + i,
                            jenkinsBaseValue: options.config['jenkinsBase' + i],
                            jenkinsBaseError : (options.errors && options.errors['jenkinsBase' + i]) ? options.errors['jenkinsBase' + i][0] : undefined,
                            cloneTypeName: 'cloneType' + i,
                            cloneTypeValue: options.config['cloneType' + i],
                            cloneUrlName: 'gitRepoUrl' + i,
                            cloneUrlValue: options.config['gitRepoUrl' + i],
                            cloneUrlError: (options.errors && options.errors['gitRepoUrl' + i]) ? options.errors['gitRepoUrl' + i][0] : undefined,
                            jenkinsEndPointTypeName : 'jenkinsEndPointType' + i,
                            jenkinsEndPointTypeValue : options.config['jenkinsEndPointType' + i],
                            mirrorServerIdName : "mirrorServerId" + i,
                            mirrorServerIdValue : options.config['mirrorServerId' + i],
                            mirrorCloneUrlName : "mirrorCloneUrl" + i,
                            mirrorCloneUrlValue : options.config['mirrorCloneUrl' + i],
                            scope : options.scope
                        })
                    );
        }
    }
    

    return html.join('');
};


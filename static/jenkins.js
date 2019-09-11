define('plugin/jenkins/settings-form', [
    'jquery',
    'underscore',
    'bitbucket/util/server',
    'bitbucket/util/navbuilder',
    'bitbucket/util/state',
    'exports',
    'react-dom',
    'react',
    'plugin/jenkins/multi-user-select',
    'plugin/jenkins/settings-event-selector'
], function ($, _, server, navBuilder, pageState, exports, ReactDOM, React, MultiUserSelect, EventSelector) {
        var GIT_PLUGIN_ENDPOINT_TYPE = "com.nerdwin15.stash.webhook.notifier.GitPluginNotifier";
    
        var isRepositoryScope = !!pageState.getRepository(), 
            defaultUrls = {}, mirrorInfo, $form;
    
    
        function resourceUrl(resourceName) {
            var projectKey = pageState.getProject().key,
                parts = ['rest', 'jenkins', 'latest', 'projects', projectKey];

            if (isRepositoryScope) {
                parts = parts.concat([
                    'repos', 
                    pageState.getRepository().slug
                ]);
            }
            parts.push(resourceName);

            return navBuilder.newBuilder(parts).build();
        }
        
        function renderCloseIcons() {
            var $entries = $('.instance-settings-wrap');

            if ($entries.length === 1) {
                $('.remove-instance').hide();
            } else {
                $('.remove-instance').show();
            }
        }

        function mayBeHideUrlParametersAndCloneUrlSections() {
            var $selectors = $form.find('.jenkins-endpoint-type'),
                $urlParametersDiv = $form.find('#urlParametersDiv'),
                $cloneUrlSelectors = $form.find('.cloneUrl'),
                $mirrorServerIdSelectors = $form.find('.mirrorServerId'),
                $checkboxSelectors = $form.find('fieldset.checkbox'),
                doHide = true;

            $selectors.each(function (idx, el){
                var selectedType = $(el).val();
                if (selectedType === GIT_PLUGIN_ENDPOINT_TYPE){
                    doHide = false;
                    $cloneUrlSelectors.eq(idx).show();
                    !_.isEmpty(mirrorInfo) && $mirrorServerIdSelectors.eq(idx).show();
                } else {
                    $cloneUrlSelectors.eq(idx).hide();
                    $mirrorServerIdSelectors.eq(idx).hide();
                }
            });

            if (doHide) {
                $urlParametersDiv.hide();
                $checkboxSelectors.eq(1).hide();
                $checkboxSelectors.eq(2).hide();
            } else {
                $urlParametersDiv.show();
                $checkboxSelectors.eq(1).show();
                $checkboxSelectors.eq(2).show();
            }
        }
    
        function renderTestButton(data) {
            var $statusContainer = $(".status-container"),
                $status = $(".status");

            if (data.length === 1) {
                $statusContainer.empty();
                $status.html(com.nerdwin15.stash.webhook.testResult({
                    result : data[0]
                }));
                $("span", $status).tooltip();

            } else {
                $status.empty();
                $statusContainer.html(com.nerdwin15.stash.webhook.testResults({
                    results : data,
                    isRepositoryScope : isRepositoryScope
                }));
                $("span", $statusContainer).tooltip();
            }
        }

        function setDeleteButtonEnabled(enabled) {
            var $testButton = $("#testButton");
            if (enabled) {
                $testButton.removeAttr("disabled").removeClass("disabled");
            } else {
                $testButton.attr("disabled", "disabled").addClass("disabled");
            }
        }
        function removeUnavailableProtocols($select) {
            /*
             * if protocol was selected by user but currently it's disabled we have to show it
             * otherwise we remove unavailable protocols
             */

            var persistedValue = $select.data('persisted-clone-type');

            if (!defaultUrls.ssh && persistedValue !== "ssh") {
                $select.children('option[value=ssh]').remove();
            }

            if (!defaultUrls.http && persistedValue !== "http") {
                $select.children('option[value=http]').remove();
            }
        }
        function getDefaultCloneUrl(type, mirrorServerId) {
            return  !mirrorServerId ? defaultUrls[type] 
                        : defaultUrls[mirrorServerId] ? 
                        defaultUrls[mirrorServerId][type] : undefined;
        }

        function setCloneUrl($select) {
            var val = $select.val(),
                found = $select.attr('id').match(/(\d+)$/),
                $cloneUrl, $mirrorServerId, $mirrorCloneUrl, url;

            if (!found){
                $cloneUrl = $("#gitRepoUrl");
                $mirrorServerId = $("#mirrorServerId");
                $mirrorCloneUrl = $("#mirrorCloneUrl");

            } else {
                $cloneUrl = $("#gitRepoUrl" + found[1]);
                $mirrorServerId = $("#mirrorServerId" + found[1]);
                $mirrorCloneUrl = $("#mirrorCloneUrl" + found[1]);
            }

            url = getDefaultCloneUrl(val, $mirrorServerId.val());

            /*
             * Store mirror clone url as there is no way to get it on backend side
             */
            if ($mirrorServerId.val()) {
                $mirrorCloneUrl.val(url);
            }

            if (val === "ssh") {
                $cloneUrl.val( url );
                $cloneUrl.attr("disabled", "disabled").addClass("disabled");
            } else if (val === "http") {
                $cloneUrl.val( url );
                $cloneUrl.attr("disabled", "disabled").addClass("disabled");
            } else {
                $cloneUrl.removeAttr("disabled").removeClass("disabled");
            }
        }

        function addInstance(maxInstance) {
            var html = com.nerdwin15.stash.webhook.instanceFields({
                    jenkinsBaseName  : 'jenkinsBase' + (maxInstance + 1),
                    cloneTypeName  : 'cloneType'  + (maxInstance + 1),
                    cloneUrlName  : 'gitRepoUrl'  + (maxInstance + 1),
                    jenkinsEndPointTypeName  : 'jenkinsEndPointType'  + (maxInstance + 1),
                    mirrorServerIdName : "mirrorServerId" + (maxInstance + 1),
                    mirrorCloneUrlName : "mirrorCloneUrl" + (maxInstance + 1),
                    displayAddButton : false,
                    scope : {type : (isRepositoryScope ? 'REPOSITORY' : 'PROJECT')}
                });

            $('#jenkinsInstances').append(html);

            var $select = $('#jenkinsInstances').find('#cloneType'  + (maxInstance + 1));

            removeUnavailableProtocols($select);
            setCloneUrl($select);

            renderCloseIcons();

            mayBeHideUrlParametersAndCloneUrlSections();

            updateMirrors(mirrorInfo);
        }

        function serializeForm(){
            var $dialogFormElements = $('#hook-config-dialog form *[name]'), data = {};

            $dialogFormElements.each(function(idx, item){
                var $item = $(item);

                if($item.is('select, input[type=text], textarea, input[type=hidden]')) {
                   data[$item.attr('name')] = $item.val();
                } else if($item.is('input[type=checkbox]')) {
                   data[$item.attr('name')] = !!$item.attr('checked');
                } else if($item.is('textarea')) {
                   data[$item.attr('name')] = $item.text();
                }

            });

            return data;

        }
        function configureCloneUrls(){
            server.rest({
                    url: resourceUrl('config')
            }).success(function(data) {

                $.extend(defaultUrls, data);

                $(".instance-settings-wrap").each(function(idx, item){
                    var $item = $(item),
                        $cloneUrl = $item.find(".clone-url"),
                        $cloneType = $item.find(".clone-type");

                    //Some old installations may not have clone type in settings
                    if ($cloneUrl.val() !== "" && !$cloneType.val()) {
                        var cloneUrl = $cloneUrl.val();
                        if (cloneUrl === defaultUrls.ssh) {
                            $cloneType.val('ssh');
                        } else if (cloneUrl === defaultUrls.http) {
                            $cloneType.val('http');
                        } else {
                            $cloneType.val('custom');
                        }
                    }
                    removeUnavailableProtocols($cloneType);
                    setCloneUrl($cloneType);
                });
            });
        }

        function attachFormListeners(eventSelector) {
            $form.off();

            $form.change(function(e) {
                var $target = $(e.target);

                if ($target.is(".clone-type")) {
                        setCloneUrl($target);
                }
                if ($target.is(".jenkins-endpoint-type")) {
                    mayBeHideUrlParametersAndCloneUrlSections();
                }
                if ($target.is(".mirror-server-id")) {
                    var $wrap = $target.parents(".instance-settings-wrap"),
                        $cloneTypeSelect = $wrap.find(".clone-type");

                    setCloneUrl($cloneTypeSelect);
                }

            });

            $form.click(function(e) {
                var $target = $(e.target),
                    maxInstance = 1,
                    $spinner = $('.jenkins-spinner');

                    $(".field-group.jenkins-base").each(function(idx, item) {

                        var id = $(item).children('input').attr('id'),
                            found = id.match(/(\d+)$/);

                        if (found){
                            var v = parseInt(found[0]);

                            if (v > maxInstance) {
                                maxInstance = v;
                            }
                        }
                    });

                if ($target.is(".event-selector .aui-lozenge")) {
                    e.preventDefault();
                    eventSelector.onChange($target);
                }

                if ($target.is("#addInstanceButton")) {
                    addInstance(maxInstance);
                }
                if ($target.is(".remove-instance")) {
                    e.preventDefault();
                    $target.parents('.instance-settings-wrap').remove();

                    renderCloseIcons();

                    mayBeHideUrlParametersAndCloneUrlSections();
                }

                if ($target.is("#testButton")) {
                    var params =$form.find("#urlParameters").val();
                    if (params) {
                        urlParamsPreCheck(params);
                    } 
                    setDeleteButtonEnabled(false);
                    $spinner.show();
                    $spinner.spin();

                    server.rest({
                        url: resourceUrl('test'),
                        type: 'POST',
                        data: serializeForm()
                    }).always(function () {
                        $spinner.hide();
                        $spinner.spinStop();
                        setDeleteButtonEnabled(true);
                    }).success(function (response) {
                        renderTestButton(response);
                    });
                }
                
            });
        }
        function urlParamsPreCheck(params){
            server.rest({
                url: resourceUrl('test-url-params') + "?params=" + encodeURIComponent(params),
                statusCode : {
                    '*' : function(xhr, textStatus, errorThrown, dominantError) {
                        
                        if (textStatus === 'error') {
                            return { 
                                shouldReload : false, 
                                title: 'Error', 
                                message: dominantError.message || 'unknown error'
                            };
                        }
                    }
                }
            }).then(function(response){
                if (response.length) {
                    
                    var body = (response.length === 1) ?
                        AJS.I18n.getText('stash.webhook.jenkins.url.parameters.warning.body.singular', response.join(', ')) :
                        AJS.I18n.getText('stash.webhook.jenkins.url.parameters.warning.body.plural', response.join(', '));
                    
                    AJS.flag({
                        type: 'warning',
                        close: 'auto',
                        title: AJS.I18n.getText('stash.webhook.jenkins.url.parameters.warning.title'),
                        body: body
                    });
                }
            });
            
        }

        function renderMultiUserSelect(){
            var $ignoreCommittersContainer = $('#multi-user-select'),
                repository = pageState.getRepository();

            ReactDOM.render(React.createElement(MultiUserSelect.default, {
                users : $ignoreCommittersContainer.data('users'),
                accessKeys : $ignoreCommittersContainer.data('access-keys'),
                projectKey : pageState.getProject().key,
                repositorySlug : repository === undefined ? undefined : repository.slug
            }), $ignoreCommittersContainer[0]);

        }
        //returns deferred object with repository payload
        function getRepository(){
            if (isRepositoryScope){
                return $.Deferred().resolve(pageState.getRepository());
            } else {
                return server.rest({
                    url: AJS.contextPath() + "/rest/api/1.0/projects/" + pageState.getProject().key + "/repos"
                }).then(function(r) {
                    var values = r.values;

                    return values.length?
                        /*
                         * mirroring is defined at project level
                         * so it's safe to just get first repo
                         */
                        $.Deferred().resolve(values[0])
                        : $.Deferred().reject();
                });
            }
        }
        function fetchMirrorConfig() {
            mirrorInfo = []; //clear existing data

            getRepository().then(function(repo){
                return server.rest({
                    url: AJS.contextPath() + "/rest/mirroring/latest/repos/" + repo.id + "/mirrors",
                    statusCode : {
                        404 : false, // HTTP 404 when Mirroring Upstream Capability plugin is disabled
                        409 : false // HTTP 409 is raised when the server is not DC
                        // , and will break the UI if not ignored.
                    }
                }).then(function(data){
                    data.repository = repo;
                    return $.Deferred().resolve(data);
                });

            }).done(function(data) {
                if (!data.values.length) {
                    return;
                }
                var repository = data.repository;
                
                _.each(data.values, function(item){
                    $.ajax({ //use jquery for cross origin requests
                        type: 'GET',
                        contentType: 'application/json',
                        dataType: 'json',
                        url: item.links.self[0].href
                    }).always(function(response, textStatus) {
                        //ignore failed requests to mirrors
                        if (textStatus === "success" && response.available) {
                            registerMirrorResponse(repository, item.mirrorServer.id, response);
                        } 
                    });
                });
            });

        }
        function registerMirrorResponse(repository, mirrorServerId, r){
            var urls = r.links.clone,
                httpCloneUrl = _.find(urls,function(item){return item.name ===  "http" }),
                sshCloneUrl = _.find(urls,function(item){return item.name ===  "ssh" }),
                mirrorUrls = {};

            if (httpCloneUrl){
                mirrorUrls.http = isRepositoryScope ? httpCloneUrl.href 
                    : addRepositoryPlaceHolder(httpCloneUrl.href, repository.slug);
            }

            if (sshCloneUrl){
                mirrorUrls.ssh = isRepositoryScope ? sshCloneUrl.href 
                    : addRepositoryPlaceHolder(sshCloneUrl.href, repository.slug);
            }

            defaultUrls[mirrorServerId] = mirrorUrls;
            
            var info = _.extend(r, {
               mirrorServerId : mirrorServerId 
            });

            mirrorInfo.push(info);

            updateMirrors(mirrorInfo);
        }
        function addRepositoryPlaceHolder(url, slug){
            var re = new RegExp("(\/)" + slug + "(\.git)");

            return url.replace(re, "$1{REPOSITORY}$2");

        }
        function updateMirrors(mirrorInfo) {
            if (!mirrorInfo || !mirrorInfo.length) {
                return;
            }
            var mirrors = _.sortBy(mirrorInfo, 'mirrorName');
            
            $(".instance-settings-wrap").each(function(idx, item) {
                var $item = $(item),
                    $endPoint=$item.find('.jenkins-endpoint-type'),
                    $cloneType=$item.find('.clone-type'),
                    $mirrorWrap = $item.find(".mirrorServerId"),
                    $mirrorSelect = $item.find(".mirror-server-id"),
                    persisted = $mirrorSelect.data("persisted-mirror-server-id"),
                    found = false;

                $mirrorSelect.empty();

                $mirrorSelect.append($("<option/>", {
                   value : "",
                   text : "Primary", //TODO i18n
                   selected : !persisted
                }));
                    
                _.each(mirrors, function(mirror){
                    $mirrorSelect.append($("<option/>", {
                       value : mirror.mirrorServerId,
                       text : mirror.mirrorName,
                       selected : persisted === mirror.mirrorServerId
                    }));
                    if (!found) {
                        found = (persisted === mirror.mirrorServerId);
                    }
                });
                
                if (!found  && !!persisted) {
                    $mirrorSelect.append($("<option/>", {
                       value : persisted,
                       text : "missed (" + persisted + ")", 
                       selected : true
                    }));
                }
                
                setCloneUrl($cloneType);

                if ($endPoint.val() === GIT_PLUGIN_ENDPOINT_TYPE) {
                    $mirrorWrap.show();
                }
            });
        }
        
        exports.onReady = function () {
            var eventSelector = new EventSelector();            
            
            $form = $(".jenkins-hook-form-inner");
            
            configureCloneUrls();

            fetchMirrorConfig();

            eventSelector.init();

            mayBeHideUrlParametersAndCloneUrlSections();

            attachFormListeners(eventSelector);

            renderCloseIcons();

            renderMultiUserSelect();
        }

});

define('plugin/jenkins/pr-triggerbutton', [
    'jquery',
    'bitbucket/util/state',
    'bitbucket/util/server'
], function ($, pageState, server) {

    function getResourceUrl() {
        return AJS.contextPath() + '/rest/jenkins/latest/projects/'
                + pageState.getProject().key + '/repos/'
                + pageState.getRepository().slug + '/triggerJenkins'
                + '?pr_id=' + pageState.getPullRequest().id;
    }
    ;

    function showAJSPre8Spinner($button, initialText) {
        var waiting = '<span class="aui-icon aui-icon-wait">Wait</span>';

        $button.attr("disabled", "disabled").html(waiting + " " + initialText);
    }

    function showAJS8Spinner($button) {
        var waiting = '<aui-spinner size="small"></aui-spinner>';
        $button.attr("disabled", "disabled").html(waiting);
    }

    var showSpinner = (AJS.version.indexOf("8") === 0) ? showAJS8Spinner : showAJSPre8Spinner;

    server.rest({
        url: AJS.contextPath() + "/rest/jenkins/latest/projects/" + pageState.getProject().key + "/repos/" +
                pageState.getRepository().slug + "/pullrequest-button-state",
        data: {pr_id: pageState.getPullRequest().id},
        type: 'GET',
        statusCode: {
            200: function (buttonState) {
                if (buttonState.state === "HIDE") {
                    $(".triggerJenkinsBuild").css("display", "none");
                } else if (buttonState.state === "DISABLE") {
                    $(".triggerJenkinsBuild")
                                .attr("title", buttonState.reason)
                                .css("color", "#999")
                                .attr("disabled", true);
                } else {
                    $(".triggerJenkinsBuild").click(function () {
                        var $this = $(this),
                            initialText = $this.text();

                        showSpinner($this, initialText);

                        server.ajax({
                            url: getResourceUrl(),
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                            success: function () {
                                // Place in timer for UI-happiness - might go "too quick" and not notice
                                // it actually triggered
                                setTimeout(function () {
                                    $this.removeAttr("disabled").text(initialText);
                                }, 500);
                            }
                        });

                        return false;
                    });
                }
            },
        }
    });
});

AJS.$(document).ready(function () {
    require('plugin/jenkins/pr-triggerbutton');
});

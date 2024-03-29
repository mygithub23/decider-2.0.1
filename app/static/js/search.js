window.full_search_string = "";

// ---------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

//-------------------------
// function to sanitize HTML content
var sanitizer = {};

(function ($) {
    function trimAttributes(node) {
        $.each(node.attributes, function () {
            var attrName = this.name;
            var attrValue = this.value;
            if (attrName) {
                if (attrValue.indexOf("javascript:") == 0) {
                    $(node).removeAttr(attrName);
                }
            } else {
            }
        });
    }

    function sanitize(html, s = true) {
        console.log("-----------------Start trace sanitize(html)---------------------------");
        console.trace("sanitizer.sanitize html param", html);
        console.log("----------------- End trace sanitize(html)---------------------------");

        var output = $($.parseHTML("<div>" + html + "</div>", null, false));
        output.find("*").each(function () {
            trimAttributes(this);
        });
        console.log("is output equal? output.html() ----------------------- 00000000000");
        console.log(`html: \n , ${html}`);
        console.log("output");
        console.table(output);
        console.log(`output.html(): \n, ${output.html()}`);

        if (output.html() === html) {
            console.log("**** output.html() ==== html *********");
        } else {
            console.log("**** output.html() !== html *********");
        }

        if (s) {
            console.log("It is True - output ----------------------- 11111111112: \n");
            console.table(output);
            console.log("It is True - output.html() ----------------------- 11111111113: \n" + output.html());

            if (output.html() === html) {
                true;
            } else {
                false;
            }

            //return output.html();
        } else {
            console.log("stringResult Before replace output.html()----------------------- 222222222 : ");
            // console.log(output);
            console.log(output.html());


            console.log("stringResult Before replace output ----------------------- 3333333333333 : ");
            // console.log(JSON.parse(output.html()));
            console.log("output: ");
            console.table(output);


            stringResult = output.html().replace(/<(|\/|[^>\/bi]|\/[^>bi]|[^\/>][^>]+|\/[^>][^>]+)>/g, "");

            console.log("stringResult After output.html().replace  -----------------------444444444444 : ");
            console.log(`stringResult: \n, ${stringResult}`);
            console.log(`stringResult: \n, ${stringResult}`);
            console.log(`html: \n, ${html}`);

            if (stringResult === html) {
                console.log("**** stringResult ==== html *********");
            } else {
                console.log("**** stringResult!== html *********");
            }

            if (stringResult === html) {
                return true;
            } else {
                return false;
            }
            // return true;
        }
    }

    sanitizer.sanitize = sanitize;
})(jQuery);

// ------------------------

// ---------------------------------------------------------------------------------------------------------------------

// Full-Fat Search Page Functionality

$(document).ready(function () {
    // defaults "reduce flashing to off", but otherwise ensures the checkbox/setting matches the prior state
    var reduce_flashing = sessionStorage.getItem("search_reduce_flashing");
    if (reduce_flashing === null) {
        sessionStorage.setItem("search_reduce_flashing", "off");
    } else if (reduce_flashing === "on") {
        $("#flashing-disable").prop("checked", true).triggerHandler("click");
    }

    // fill search options from URL
    var url = new URL(window.location.href);

    // search string
    var searchStr = url.searchParams.get("search");
    window.full_search_string = searchStr;
    $("#full-search-bar").val(searchStr);

    // tactic selections
    var tactics = url.searchParams.getAll("tactics");
    sessionStorage.setItem("tactic_fs_checkbox_selections", JSON.stringify(tactics));
    syncFilters("tactic_fs");

    // platform selections
    var platforms = url.searchParams.getAll("platforms");
    sessionStorage.setItem("platform_fs_checkbox_selections", JSON.stringify(platforms));
    syncFilters("platform_fs");

    // data source selections
    var data_sources = url.searchParams.getAll("data_sources");
    sessionStorage.setItem("data_source_fs_checkbox_selections", JSON.stringify(data_sources));
    syncFilters("data_source_fs");

    let version_v_strip = Math.floor(parseFloat($("#versionSelect").val().replace("v", "")));
    if (version_v_strip >= 10) {
        $("#dataSourceSelect").show();
    } else {
        $("#dataSourceSelect").hide();
    }

    searchFetchAndRender(false);
});

// Tactic Filtering Funcs
var searchClearTactics = _.debounce(function () {
    clearFilters("tactic_fs");
    searchFetchAndRender(false);
}, 100);

var searchUpdateTactics = _.debounce(function (checkbox) {
    updateFilters("tactic_fs", checkbox);
    searchFetchAndRender(false);
}, 100);

// Platform Filtering Funcs
var searchClearPlatforms = _.debounce(function () {
    clearFilters("platform_fs");
    searchFetchAndRender(false);
}, 100);

var searchUpdatePlatforms = _.debounce(function (checkbox) {
    updateFilters("platform_fs", checkbox);
    searchFetchAndRender(false);
}, 100);

// Data Source Filtering Funcs
var searchClearDataSources = _.debounce(function () {
    clearFilters("data_source_fs");
    searchFetchAndRender(false);
}, 100);

var searchUpdateDataSources = _.debounce(function (checkbox) {
    updateFilters("data_source_fs", checkbox);
    searchFetchAndRender(false);
}, 100);

var searchBarInputChange = _.debounce(function (search_string) {
    window.full_search_string = search_string.trim();
    searchFetchAndRender(false);
}, 200);

function fullSearchTechniqueTemplate(t, wasLastClicked) {
    // Pull links from description as it will be placed inside of a link itself
    let desc = $(`<p>${t.description}</p>`);
    desc.find("a").remove();
    desc = desc.html();

    let tagSection = "";
    let akas;

    let cardId = t.tech_id_plain.replace(/\./, "-");
    let cardLabel = `${t.tech_name} (${t.tech_id})`;

    const sanitized = sanitizer.sanitize(`<span class="tag is-primary last-result-clicked-aka">${aka}</span>`);
    const sanitized2 = sanitizer.sanitize(`<div class="tags">${akas}</div>`);
    const sanitized3 = sanitizer.sanitize(`
    <div id="${cardId}" class="card answer box last-result-clicked">

        <div class="columns">
            <div class="column">
                <a target="_blank" rel="noreferrer noopener" class="ans-url last-result-clicked-content" href="${t.attack_url}">
                    <span class="ans-label">${cardLabel}</span>
                    <span class="icon is-small">
                        <i class="mdi mdi-link"></i>
                    </span>
                </a>
            </div>
            <div class="column is-narrow">
                <span class="has-tooltip-bottom tooltip-bottom-leftshift" data-tooltip="This is the most recently clicked search result" style="z-index: 2;">
                    <i class="mdi mdi-24px mdi-history last-result-clicked-content"></i>
                </span>
            </div>
        </div>

        <div class="card-content">
            <a class="ans-path" data-techid="${cardId}" onClick="recordSearchResultClicked(this)" href="${t.internal_url}">
                <p class="is-size-5 ans-content">${desc}</p>
            </a>
            ${tagSection}
        </div>

    </div>
`);

    if (wasLastClicked) {
        // Only form AKA tag section if there were any AKAs
        if (t.akas.length > 0) {
            akas = _.join(
                _.map(t.akas, function (aka) {
                    if (sanitized) return `<span class="tag is-primary last-result-clicked-aka">${aka}</span>`;
                }),
                ""
            );
            if (sanitized2) tagSection = `<div class="tags">${akas}</div>`;
        }
        if (sanitized3)
            return $(`
            <div id="${cardId}" class="card answer box last-result-clicked">

                <div class="columns">
                    <div class="column">
                        <a target="_blank" rel="noreferrer noopener" class="ans-url last-result-clicked-content" href="${t.attack_url}">
                            <span class="ans-label">${cardLabel}</span>
                            <span class="icon is-small">
                                <i class="mdi mdi-link"></i>
                            </span>
                        </a>
                    </div>
                    <div class="column is-narrow">
                        <span class="has-tooltip-bottom tooltip-bottom-leftshift" data-tooltip="This is the most recently clicked search result" style="z-index: 2;">
                            <i class="mdi mdi-24px mdi-history last-result-clicked-content"></i>
                        </span>
                    </div>
                </div>

                <div class="card-content">
                    <a class="ans-path" data-techid="${cardId}" onClick="recordSearchResultClicked(this)" href="${t.internal_url}">
                        <p class="is-size-5 ans-content">${desc}</p>
                    </a>
                    ${tagSection}
                </div>

            </div>
        `);
    } else {
        // Only form AKA tag section if there were any AKAs
        const sanitized4 = sanitizer.sanitize(`<span class="tag is-primary">${aka}</span>`);
        const sanitized5 = sanitizer.sanitize(`<div class="tags">${akas}</div>`);
        const sanitized6 = sanitizer.sanitize(`
            <div id="${cardId}" class="card answer box">

                <a target="_blank" rel="noreferrer noopener" class="ans-url" href="${t.attack_url}">
                    <span class="ans-label">${cardLabel}</span>
                    <span class="icon is-small">
                        <i class="mdi mdi-link"></i>
                    </span>
                </a>

                <div class="card-content">
                    <a class="ans-path" data-techid="${cardId}" onClick="recordSearchResultClicked(this)" href="${t.internal_url}">
                        <p class="is-size-5 ans-content">${desc}</p>
                    </a>
                    ${tagSection}
                </div>

            </div>
        `);

        if (t.akas.length > 0) {
            akas = _.join(
                _.map(t.akas, function (aka) {
                    if (sanitized4) return `<span class="tag is-primary">${aka}</span>`;
                }),
                ""
            );
            if (sanitized5) tagSection = `<div class="tags">${akas}</div>`;
        }

        if (sanitized6)
            return $(`
            <div id="${cardId}" class="card answer box">

                <a target="_blank" rel="noreferrer noopener" class="ans-url" href="${t.attack_url}">
                    <span class="ans-label">${cardLabel}</span>
                    <span class="icon is-small">
                        <i class="mdi mdi-link"></i>
                    </span>
                </a>
                <div class="card-content">
                    <a class="ans-path" data-techid="${cardId}" onClick="recordSearchResultClicked(this)" href="${t.internal_url}">
                        <p class="is-size-5 ans-content">${desc}</p>
                    </a>
                    ${tagSection}
                </div>
            </div>
        `);
    }
}

// if brought here from a version change on the search page, reload. if doing normal searching, dont.
function searchFetchAndRender(version_change) {
    let paramStr;

    let search_string = window.full_search_string;
    let resultsArea = $("#technique-search-list");
    let loadingIcon = $("#loading-message");

    let attackVersion = $("#versionSelect").val();
    let params = [
        ["version", attackVersion],
        ["search", search_string],
    ];

    if (version_change) {
        clearFilters("tactic_fs");
        clearFilters("platform_fs");
        clearFilters("data_source_fs");
        paramStr = new URLSearchParams(params).toString();
        window.history.replaceState({}, "DECIDER", `/search/page?${paramStr}`);
        window.location.reload();
        return;
    }

    let pickedTactics = getChkSelections("tactic_fs");
    _.forEach(pickedTactics, function (tactic) {
        params.push(["tactics", tactic]);
    });

    let pickedPlatforms = getChkSelections("platform_fs");
    _.forEach(pickedPlatforms, function (platform) {
        params.push(["platforms", platform]);
    });

    let pickedDataSources = getChkSelections("data_source_fs");
    _.forEach(pickedDataSources, function (data_source) {
        params.push(["data_sources", data_source]);
    });

    paramStr = new URLSearchParams(params).toString();
    window.history.replaceState({}, "DECIDER", `/search/page?${paramStr}`);

    const sanitized = sanitizer.sanitize("<p>Please type a search query</p>");
    // 0-length case handled in front-end too
    if (search_string.length === 0) {
        resultsArea.empty();
        if (sanitized) resultsArea.append("<p>Please type a search query</p>");
        return;
    }

    resultsArea.hide();
    loadingIcon.show();

    $.ajax({
        type: "GET",
        url: `/search/full?${paramStr}`,
        dataType: "json",
        success: function (resp) {
            resultsArea.empty();

            // if we have visited this url recently, mark what technique id card is to be highlighted as last clicked
            let lastResultClicked = sessionStorage.getItem("full-search-last-result-clicked");
            let lastResultTechId = null;
            if (lastResultClicked !== null && lastResultClicked !== "") {
                lastResultClicked = JSON.parse(lastResultClicked);
                if (window.location.href === lastResultClicked.search_url) {
                    lastResultTechId = lastResultClicked.tech_id;
                    sessionStorage.setItem("full-search-last-result-clicked", "");
                }
            }

            const sanitized2 = sanitizer.sanitize(`<b>Search Used:</b> ${resp.status}`);
            const sanitized3 = sanitizer.sanitize(`<p>${search_used}</p>`);
            const sanitized4 = sanitizer.sanitize(`<p>${search_used}<br><i>That search yielded no results</i></p>`);
            const sanitized5 = sanitizer.sanitize(`<p>${resp.status}</p>`);

            // search success
            if ("techniques" in resp) {
                let search_used = `<b>Search Used:</b> ${resp.status}`;

                // results
                if (resp.techniques.length > 0) {
                    if (sanitized3 && sanitized2) resultsArea.append(`<p>${search_used}</p>`);
                    _.forEach(resp.techniques, function (t) {
                        resultsArea.append(
                            fullSearchTechniqueTemplate(t, t.tech_id_plain.replace(/\./, "-") === lastResultTechId)
                        );
                    });
                }

                // no results
                else {
                    if (sanitized4)
                        resultsArea.append(`<p>${search_used}<br><i>That search yielded no results</i></p>`);
                }
                // search failure
            } else {
                if (sanitized5) resultsArea.append(`<p>${resp.status}</p>`);
            }

            loadingIcon.hide();
            resultsArea.show();

            // results have been added, scroll to last clicked if it exists
            if (lastResultTechId !== null) document.getElementById(lastResultTechId).scrollIntoView();
        },
    });
}

// Accessibility: option to prevent white<->purple flashing
function toggleFlashReduction(checkbox) {
    var searchArea = $("#searchColumn");
    var loadingIcon = $("#loading-message");

    // enable
    if ($(checkbox).is(":checked")) {
        searchArea.css("background-color", "#F2EFFB"); // search area color similar to result cards
        searchArea.css("border-radius", "2em"); // stylish rounding
        loadingIcon.css("opacity", "0.3"); // less contrast on icon
        sessionStorage.setItem("search_reduce_flashing", "on");
    }

    // disable
    else {
        searchArea.css("background-color", "");
        searchArea.css("border-radius", ""); // clear styles
        loadingIcon.css("opacity", "");
        sessionStorage.setItem("search_reduce_flashing", "off");
    }
}

// Upon clicking a result, the page URL and clicked Tech ID are saved
//   This allows for clicking back to restore the same place on the page
//   Both are saved as to ignore different search result pages
function recordSearchResultClicked(elem) {
    var tech_id = $(elem).data("techid");

    sessionStorage.setItem(
        "full-search-last-result-clicked",
        JSON.stringify({
            search_url: window.location.href,
            tech_id: tech_id,
        })
    );
}

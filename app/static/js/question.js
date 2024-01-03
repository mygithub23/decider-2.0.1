// Namespaced global vars
// prettier-ignore
window.question = {
    answer_data: [],
    answer_view: [],
    search_str: "",
    index: "",
    version: "",
    markjs_opts: {
        accuracy: {
            value: "exactly",
            limiters: [
                ",", ".", "(", ")", "-", "_", "/", "\\", "?", "!", "'", '"', "|", "+", "@", "[", "]", "{", "}", "<",
                ">", "#", "$", "%", "^", "`", "&", "*", ":", ";", "~"
            ],
        },
    },
};

// On ready
$(document).ready(function () {
    $(window).on("resize", debounced_platformMatchHeight); // matches platform panel even after content reflow

    let version_v_strip = Math.floor(parseFloat($("#versionSelect").val().replace("v", "")));
    if (version_v_strip >= 10) {
        $("#dataSourceSelect").show();
    } else {
        $("#dataSourceSelect").hide();
    }

    initAnswerCards();
});

//----------------------------------------------------------------------------------------------------------------------
// function to sanitize HTML content
// let sanitizer = {};

// (function($) {
//     function trimAttributes(node) {
//         $.each(node.attributes, function() {
//             const attrName = this.name;
//             const attrValue = this.value;

//             // remove attribute name start with "on", possible unsafe,
//             // for example: onload, onerror...
//             //
//             // remvoe attribute value start with "javascript:" pseudo protocol, possible unsafe,
//             // for example href="javascript:alert(1)"
//             if (attrName) {
//                 // console.log('trmAttributes: %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
//                 // console.log('attrName:' + attrName);
//                 // console.log('attrValue:' + attrValue);
//                 // console.log('trmAttributes: %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
//                 console.log("------------------------------------------------ trace ----------------------------------------------------------");
//                 console.trace();
//                 console.log("------------------------------------------------ trace ----------------------------------------------------------");
//                 if (attrName.indexOf('on') == 0 || attrValue.indexOf('javascript:') == 0) {
//                     $(node).removeAttr(attrName);
//                 }
//             }   
//         });
//     }

//     function sanitize(html) {


//         const output = $($.parseHTML('<div>' + html + '</div>', null, false));
//         output.find('*').each(function() {
//             trimAttributes(this);
//         });

//         return output.html();
//     }

//     sanitizer.sanitize = sanitize;
// })(jQuery);


// ---------------------------------------------------------------------------------------------------------------------
// Clean Strings from all html tags

(function($) {
    $.sanitize = function(input) {
      /*
        var output = input.replace(/<script[^>]*?>.*?<\/script>/gi, '').
                     replace(/<[\/\!]*?[^<>]*?>/gi, '').
                     replace(/<style[^>]*?>.*?<\/style>/gi, '').
                     replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
        return output;
        */
        
        return input.replace(/<(|\/|[^>\/bi]|\/[^>bi]|[^\/>][^>]+|\/[^>][^>]+)>/g, '');
    };
})(jQuery);

$(function() {
    $('#sanitize').click(function() {
        var $input = $('#input').val();
        $('#output').text($.sanitize($input));
        console.log($.sanitize($input));
    });

});  

// ---------------------------------------------------------------------------------------------------------------------
/*
const sanitizeHTML = function (str) {
	return str.replace(/[^\w. ]/gi, function (c) {
		return '&#' + c.charCodeAt(0) + ';';
	});
};

// ---------------------------------------------------------------------------------------------------------------------
const encodeHTML = function (str) {
	return str.replace(/[^\w. ]/gi, function (c) {
		return '&#' + c.charCodeAt(0) + ';';
	});
};

let app = document.querySelector('#app');
app.innerHTML = encodeHTML('<img src="x" onerror="alert(1)">');
*/
// ---------------------------------------------------------------------------------------------------------------------

const debounced_platformMatchHeight = _.debounce(platformMatchHeight, 150);

function platformMatchHeight() {
    // aligns platform filter column to height of answer cards
    console.log("------------------------------------------------ trace ----------------------------------------------------------");
    console.trace();
    console.log("------------------------------------------------ trace ----------------------------------------------------------");

    const navBar = $(".navbarSection");
    const navTop = navBar.position().top;
    const navHeight = navBar.outerHeight(true);

    const ansHeader = $("#answerListHeader");
    const ansHeaderBottom = ansHeader.position().top + ansHeader.outerHeight(true);

    $("#filterSpacing").height(ansHeaderBottom - (navTop + navHeight));
}

function initAnswerCards() {
    // Lock input until data is ready
    $("#platform-selection input").prop("disabled", true);
    $("#questionSearch").prop("disabled", true);

    // Update page filters to match stored filter state
    syncFilters("platform");
    syncFilters("data_source");

    // GET the answer card data via API for the question specified by the <div>
    const ans_list = $("#answer-list");
    question.index = ans_list.data("index");
    question.version = ans_list.data("version");
    $.ajax({
        url: "/api/answers/",
        type: "GET",
        data: {
            index: question.index,
            tactic: ans_list.data("tactic"),
            version: question.version,
        },
        dataType: "json",
        success: function (answers) {
            // Add default score to entries so they maintain original display order unless scored by MiniSearch; save
            for (let i = 0; i < answers.length; i++) {
                answers[i].score = -i;
                answers[i].label = sanitizer.sanitize(`${answers[i].name} (${answers[i].id})`, false);
                answers[i].highlights = {};
                answers[i].content_text = sanitizer.sanitize($(answers[i].content).text(), false);

                score = answers[i].score ;
                label = answers[i].label;
                highlights = answers[i].highlights ;
                highlights2 =  answers[i].highlights;
                content_text = answers[i].content_text ;

                // score = sanitizer.sanitize( answers[i].score );
                // label = sanitizer.sanitize( answers[i].label );
                // highlights = sanitizer.sanitize( answers[i].highlights );
                // highlights2 =  answers[i].highlights;
                // content_text = sanitizer.sanitize( answers[i].content_text );

                console.log("score: " + score + ", label: " + label + ", highlights: " + highlights + ", content_text: " + content_text + "/n"); 
                
            }
            question.answer_data = answers;
            question.answer_view = answers;

            // Clear search string
            question.search_str = "";

            // Filter, sort, paginate, and display the content
            questionRender();

            // Data is loaded -> free inputs
            $("#platform-selection input").prop("disabled", false);
            $("#questionSearch").prop("disabled", false);

            platformMatchHeight();
        },
    });
}

function templateAndHighlightAnswer(ans_data) {
    // Render card with template
    const ans_card = $(sanitizer.sanitize(answerTemplate(ans_data)), false);
    console.log("answerTemplate(ans_data): ") 
    console.table(ans_data)
    console.log(Object.assign({}, ans_data));
    const map = new Map(Object.entries(ans_data));
    console.log(map)


    console.log("answerTemplate(ans_data): ") 
    console.table(answerTemplate(ans_data))
    console.log(Object.assign({}, answerTemplate(ans_data)));
    const map2 = new Map(Object.entries(answerTemplate(ans_data)));
    console.log(map2)

    console.log("--/$answerTemplate(ans_data): ") 
    console.table($(answerTemplate(ans_data)))
    console.log(Object.assign({}, $(answerTemplate(ans_data))));

    // console.log("answerTemplate(ans_data): " + answerTemplate(ans_data))
    // console.log("$(answerTemplate(ans_data)): " + $(answerTemplate(ans_data)))
    // console.log("sanitizer.sanitize(answerTemplate(ans_data)): " + sanitizer.sanitize(answerTemplate(ans_data)))
    // console.log("$(sanitizer.sanitize(answerTemplate(ans_data)): " + $(sanitizer.sanitize(answerTemplate(ans_data))))

    // Highlight label and content sections for matched terms
    if ("label" in ans_data.highlights)
        ans_card.find(".ans-label").mark(ans_data.highlights.label, question.markjs_opts);
    if ("content_text" in ans_data.highlights)
        ans_card.find(".ans-content").mark(ans_data.highlights.content_text, question.markjs_opts);

    return ans_card;
}

function gotoAnswerPage(page_num) {
    console.log("------------------------------------------------Start trace ----------------------------------------------------------");
    console.trace();
    console.log("------------------------------------------------ End trace ----------------------------------------------------------");

    const PER_PAGE = 5; // Configurable
    const answers_view = question.answer_view;
    console.log("gotoAnswerPage(page_num): " + page_num);
    // console.log("answers_view: " + answers_view);
    // console.log("answer_view: " + answer_view) 
    // console.table(answer_view)

    // Start page has content changed in-place: gotoAnswerPage(1) is called on page load
    if (question.index === "start") {
        // Holds all answer cards
        const grid =  $(sanitizer.sanitize("<div></div>"));
        console.log("grid:  ")  
        console.table(grid);

        // console.log('$("<div></div>")' + $("<div></div>"))
        // console.log('$(sanitizer.sanitize("<div></div>"): ' + $(sanitizer.sanitize("<div></div>")))
        // console.log('sanitizer.sanitize($("<div></div>"): '+ sanitizer.sanitize($("<div></div>")))
        // For all answer cards we have
        for (var i = 0; i < answers_view.length; i++) {
            // Create a new row for each 3 cards, add to master holder
            if (i % 3 === 0) {
                const row = $(sanitizer.sanitize('<div class="columns"></div>'));
                console.log("row:  ") 
                console.table(row);
                
                // console.log('$(<div class="columns"></div>)): ' + $('<div class="columns"></div>'))
                // console.log('$(sanitizer.sanitize(<div class="columns"></div>)): '+ $(sanitizer.sanitize('<div class="columns"></div>')))
                // console.log('sanitizer.sanitize$((<div class="columns"></div>)): '+ sanitizer.sanitize($('<div class="columns"></div>')))

                grid.append(row);
            }

            // Wrap answer card with column div
            const piece = $(sanitizer.sanitize('<div class="column is-one-third tactic-column"></div>'));

            

            //console.log('$(<div class="column is-one-third tactic-column"></div>);' + $('<div class="column is-one-third tactic-column"></div>'))
            // console.log('$(sanitizer.sanitize(<div class="column is-one-third tactic-column"></div>)): ' + $(sanitizer.sanitize('<div class="column is-one-third tactic-column"></div>')))
            // console.log('sanitizer.sanitize($(<div class="column is-one-third tactic-column"></div>)): ' + sanitizer.sanitize($('<div class="column is-one-third tactic-column"></div>')))

            piece.append(templateAndHighlightAnswer(answers_view[i]));
            console.log("piece: ") 
            console.table(piece);

            // Add chunk to current row
            grid.children().last().append(piece);
        }

        $("#answer-list").empty();
        $("#answer-list").append(grid);

        return;
    }

    // [Answer Cards] Get answer data, trim to current view, clear cards, repopulate
    const current_answers = _.slice(answers_view, PER_PAGE * (page_num - 1), PER_PAGE * page_num);
    console.log("current_answers: " + current_answers);
    const answer_list = $("#answer-list");
    console.log("answer_list: " + answer_list);
    answer_list.empty();
    _.forEach(current_answers, function (ans_data) {
        answer_list.append(templateAndHighlightAnswer(ans_data));
    });
    console.log("answer_list.append(templateAndHighlightAnswer(ans_data)): " + answer_list);

    // [Page Nav Bar] Calc total # of pages, fill list with page buttons, clear current, repopulate
    const total_pages = Math.ceil(answers_view.length / PER_PAGE);
    console.log("total_pages: " + total_pages);
    const page_list = $(sanitizer.sanitize("<ul>", { class: "pagination-list" }));
    console.log('page_list: ' + page_list);

    // console.log('$("<ul>", { class: "pagination-list" }): ' + $("<ul>", { class: "pagination-list" }))
    // console.log('$(sanitizer.sanitize("<ul>", { class: "pagination-list" })): ' + $(sanitizer.sanitize("<ul>", { class: "pagination-list" })))
    // console.log('sanitizer.sanitize($("<ul>", { class: "pagination-list" })): ' + sanitizer.sanitize($("<ul>", { class: "pagination-list" })))

    for (var cur_page = 1; cur_page <= total_pages; cur_page++) {
        page_list.append($(pageButtonTemplate(cur_page, cur_page === page_num)));
    }
    console.log("page_list.append($(pageButtonTemplate(cur_page, cur_page === page_num))):" + page_list)
    const answer_nav = $("#answer-nav");
    console.log("answer_nav: " + answer_nav);
    answer_nav.empty();
    answer_nav.append(page_list);
    console.log("answer_nav.append(page_list): " + answer_nav);
}

function questionRenderFrontendSearch(answer_data) {
    const map = new Map(Object.entries(answer_data));
    console.log(map)
    console.log(Object.assign({}, answer_data));
    // console.log("questionRenderFrontendSearch(answer_data): " + answer_data);
   // console.log("questionRenderFrontendSearch(answer_data): " + answer_data);

    // Terms are space-seperated chunks of text
    var terms = _.filter(question.search_str.toLowerCase().split(" "), function (t) {
        return t !== "";
    });
    
    console.log("terms: " + terms);

    // Excludes are terms that start with -, get base exclusion terms, keep non-empty
    var excludes = _.remove(terms, function (t) {
        return _.startsWith(t, "-");
    });
    console.log("excludes.remove: " + excludes);

    excludes = _.map(excludes, function (t) {
        return t.slice(1);
    });
    console.log("excludes.map: " + excludes);

    excludes = _.filter(excludes, function (t) {
        return t !== "";
    });
    console.log("excludes.filter: " + excludes);


    var new_search = _.join(terms, " "); // Make new search string from positive associations
    console.log("new_search: " + new_search);

    // Conduct fuzzy (+prefix) search against the "label"/"content_text" fields of the answer cards
    var miniSearch = new MiniSearch({ fields: ["label", "content_text"], storeFields: ["label", "content_text"] });
    console.log("miniSearch: ") 
    console.table(miniSearch);
    const map2 = new Map(Object.entries(miniSearch));
    console.log(map2)
    console.log(Object.assign({}, miniSearch));
    miniSearch.addAll(answer_data);
    var results = miniSearch.search(new_search, {
        prefix: (term) => term.length > 2,
        fuzzy: (term) => (term.length > 2 ? 0.15 : null),

        // Remove any results containing the excluded terms
        filter: function (result) {
            console.log("result: " + result)
            for (const exclusion of excludes) {
                console.log("exclusion: " + exclusion) 
                console.log("result.label.toLowerCase(): " + result.label.toLowerCase())
                console.log("exclusion.toLowerCase(): " + exclusion.toLowerCase())
                console.log("result.content_text.toLowerCase(): " + result.content_text.toLowerCase)
                if (
                    result.label.toLowerCase().includes(exclusion) ||
                    result.content_text.toLowerCase().includes(exclusion)
                )
                    return false;
            }
            return true;
        },
    });

    // For all search results
    _.forEach(results, function (entry) {
        // Restructure match data that MiniSearch returns
        // Instead of specifying terms and where they exist ...
        //     We specify places and what terms exist in them
        const field_to_terms = {};
        for (const [term, fields] of Object.entries(entry.match)) {
            console.log("term: " + term)
            console.log("fields: " + fields)
            _.forEach(fields, function (field) {
                if (field in field_to_terms) field_to_terms[field].push(term);
                else field_to_terms[field] = [term];
            });
        }

        // Overwrite default score with the actual search score
        const matched_answer = _.filter(answer_data, function (a) {
            console.log("a.id: " + a.id)
            console.log("entry.id: " + entry.id)
            return a.id === entry.id;
        })[0];

        console.log("matched_answer: " + matched_answer);
        console.log("field_to_terms: " + field_to_terms);
        console.log("matched_answer.score: " + matched_answer.score);+
        console.log("matched_answer.highlights: " + matched_answer.highlights);
        console.log("entry.score: " + entry.score);

        matched_answer.score = entry.score;
        matched_answer.highlights = field_to_terms;
    });

    answer_data = _.sortBy(answer_data, [
        function (c) {
            console.log("answer_data: ") 
            console.table(answer_data);
            console.log(Object.assign({}, answer_data));
            const map2 = new Map(Object.entries(answer_data));
            console.log(map2)
            return -c.score;
        },
    ]); // Highest scores first
    // console.log("answer_data: ") 
    // console.table(answer_data);

    return answer_data;
}

function questionRenderBackendSearchRequest(answer_data) {
    console.log("------------------------------------------------Start trace ----------------------------------------------------------");
    console.trace();
    console.log("------------------------------------------------ End trace ----------------------------------------------------------");

    // form URL params for request
    let ansList = $("#answer-list");
    console.log("ansList: " + ansList);
    let params = [
        ["version", ansList.data("version")],
        ["index", ansList.data("index")],
        ["tactic_context", ansList.data("tactic")],
        ["search", question.search_str],
    ];
    console.log("params: " + params);

    _.forEach(getChkSelections("platform"), function (platform) {
        params.push(["platforms", platform]);
    });
    _.forEach(getChkSelections("data_source"), function (data_source) {
        params.push(["data_sources", data_source]);
    });
    let paramStr = new URLSearchParams(params).toString();
    console.log("paramStr: " + paramStr);
    console.log("paramStr.length: " + paramStr.length);

    // request the user's search
    $.ajax({
        type: "GET",
        url: `/search/answer_cards?${paramStr}`,
        dataType: "json",
        success: function (searchResponse) {
            // transform cards using response from server
            console.log("searchResponse: " + searchResponse);
            console.log("searchResponse.length: " + searchResponse.length);
            console.log("anwwer_data: " + answer_data);
            questionRenderBackendSearchResponse(answer_data, searchResponse);
        },
    });
}

function questionRenderBackendSearchResponse(answer_data, searchResponse) {
    console.log("------------------------------------------------Start trace ----------------------------------------------------------");
    console.trace();
    console.log("------------------------------------------------ End trace ----------------------------------------------------------");

    console.log("questionRenderBackendSearchResponse(answer_data, searchResponse): " + answer_data);
    console.log("questionRenderBackendSearchResponse(answer_data, answer_data): " + answer_data);
    // search successful
    if ("results" in searchResponse) {
        // there were results -> set status and re-order / highlight cards
        if (Object.keys(searchResponse.results).length > 0) {
            // $(sanitizer.sanitize("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}`));
            sanitizer.sanitize($("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}`));

            // console.log('$("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}`): ' + $("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}`))
            // console.log('$(sanitizer.sanitize("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}`)): ' + $(sanitizer.sanitize("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}`)))
            // console.log('sanitizer.sanitize($("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}`)): ' + sanitizer.sanitize($("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}`)))
            // console.log('$("#ans-search-status").html(sanitizer.sanitize(`<b>Search Used:</b> ${searchResponse.status}`)): ' + $("#ans-search-status").html(sanitizer.sanitize(`<b>Search Used:</b> ${searchResponse.status}`)))
            // console.log('$(sanitizer.sanitize("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}`));')
            

            // update answer cards with search result scores
            _.forEach(answer_data, function (answerEntry) {
                if (answerEntry.id in searchResponse.results) {
                    let result = searchResponse.results[answerEntry.id];

                    answerEntry.score = result.score;
                    answerEntry.highlights.label = result.display_matches;
                    answerEntry.highlights.content_text = result.display_matches;
                    answerEntry.highlights.additional = result.additional_matches;
                    console.log("answerEntry.highlights: " + answerEntry.highlights);
                    console.log("answerEntry.score: " + answerEntry.score);
                    console.log("answerEntry.highlights.label: " + answerEntry.highlights.label);
                    console.log("answerEntry.highlights.content_text: " + answerEntry.highlights.content_text);
                    console.log("answerEntry.highlights.additional: " + answerEntry.highlights.additional);
                    console.log("answerEntry: " + answerEntry);
                    console.log("answerEntry.id: " + answerEntry.id);
                    console.log("answerEntry.label: " + answerEntry.label);
                    console.log("answerEntry.content_text: " + answerEntry.content_text);
                    console.log("result.score: " + result.score);
                    console.log("result.display_matches: " + result.display_matches);
                    console.log("result.additional_matches: " + result.additional_matches);

                }
            });

            // score answer cards score descending
            answer_data = _.sortBy(answer_data, [
                function (c) {
                    return -c.score;
                },
            ]);
        }

        // no matches found -> just set status
        else {
            sanitizer.sanitize($("#ans-search-status").html(`
                <b>Search Used:</b> ${searchResponse.status}<br>
                <span style="color: red;"><i>No matches - cards will stay in their default order</i></span>
            `));
            
            // console.log('$("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}<br><span style="color: red;"><i>No matches - cards will stay in their default order</i></span>`): ' + $("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}<br><span style="color: red;"><i>No matches - cards will stay in their default order</i></span>`))
            // console.log('$(sanitizer.sanitize("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}<br><span style="color: red;"><i>No matches - cards will stay in their default order</i></span>`)): ') + $(sanitizer.sanitize("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}<br><span style="color: red;"><i>No matches - cards will stay in their default order</i></span>`))
            // console.log('sanitizer.sanitize($("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}<br><span style="color: red;"><i>No matches - cards will stay in their default order</i></span>`)): ') + sanitizer.sanitize($("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}<br><span style="color: red;"><i>No matches - cards will stay in their default order</i></span>`))
        }

        console.log("answer_data: " + answer_data);
        console.log("answer_data.length: " + answer_data.length);
        console.log("question.answer_data: " + question.answer_data);

        question.answer_view = answer_data;
        gotoAnswerPage(1);
    }

    // bad search query
    else {
        // display error status in red
        sanitizer.sanitize($("#ans-search-status").html(`<span style="color: red;">${searchResponse.status}</span>`));
                         //$("#ans-search-status").html(`<span style="color: red;">${searchResponse.status}</span>`)
        // console.log('$("#ans-search-status").html(`<span style="color: red;">${searchResponse.status}</span>`): ' + $("#ans-search-status").html(`<span style="color: red;">${searchResponse.status}</span>`))
        // console.log('$(sanitizer.sanitize("#ans-search-status").html(`<span style="color: red;">${searchResponse.status}</span>`)): ' + $(sanitizer.sanitize("#ans-search-status").html(`<span style="color: red;">${searchResponse.status}</span>`)))
        // console.log('sanitizer.sanitize($("#ans-search-status").html(`<span style="color: red;">${searchResponse.status}</span>`)): ' + sanitizer.sanitize($("#ans-search-status").html(`<span style="color: red;">${searchResponse.status}</span>`)))

        // don't re-order / highlight answers
        console.log("answer_data: " + answer_data);
        console.log("answer_data.length: " + answer_data.length);
        console.log("question.answer_data: " + question.answer_data);
        question.answer_view = answer_data;
        gotoAnswerPage(1);
    }
}

function questionRender() {
    console.log("------------------------------------------------Start trace ----------------------------------------------------------");
    console.trace();
    console.log("------------------------------------------------ End trace ----------------------------------------------------------");

    // clone data for transform, get filters of cards to remove
    const answer_data = JSON.parse(JSON.stringify(question.answer_data));
    const platform_selections = getChkSelections("platform");
    const data_source_selections = getChkSelections("data_source");
    console.log("platform_selections: " + platform_selections);
    console.log("data_source_selections: " + data_source_selections);
    console.log("answer_data: ")
    console.table (answer_data)

    // front-end handles removing filtered-out cards
    if (platform_selections.length > 0) {
        // Remove all answers that share no platforms with selected
        _.remove(answer_data, function (answer) {
            const answer_platforms = _.split(answer.platforms, ",");
            console.log("answer_platforms: " + answer_platforms);
            if (_.intersection(platform_selections, answer_platforms).length === 0) {
                return true;
            }
        });
    }
    if (data_source_selections.length > 0) {
        // Remove all answers that share no platforms with selected
        _.remove(answer_data, function (answer) {
            const data_source_platforms = _.split(answer.data_sources, ",");
            console.log("data_source_platforms: " + data_source_platforms);
            if (_.intersection(data_source_selections, data_source_platforms).length === 0) {
                return true;
            }
        });
    }

    // no search -> set view, goto 1
    if (question.search_str.length === 0) {
        question.answer_view = answer_data;
        console.log("question.answer_view: ") 
        console.table(question.answer_view)
        console.log("question.answer_view.length: " + question.answer_view.length);
        gotoAnswerPage(1);
        return;
    }
    console.log("question.answer_view: " + question.answer_view);
    console.log("question.answer_view.length: " + question.answer_view.length);
    console.log("answer_data: " + answer_data);
    // Tactic->Techs, Tech->Subs use backend as to search more content
    if ($("#answer-list").data("index") === "start") {
        question.answer_view = questionRenderFrontendSearch(answer_data);
        console.log("question.answer_view: " + question.answer_view);
        console.log("question.answer_view.length: " + question.answer_view.length);
        console.log("answer_data: " + answer_data);
        gotoAnswerPage(1);
    } else {
        questionRenderBackendSearchRequest(answer_data);
    }
}

function answerTemplate(answer) {
    // form additional matches section if present and 1+ matches exist

    let additionalMatches = "";
    if ("additional" in answer.highlights && answer.highlights.additional.length !== 0) {
        let matchLocations;

        // card is SubTechnique itself or has no subs - don't mention subs
        if (answer.id.includes(".") || answer.num === 0) {
            matchLocations = "Description";
        }
        // Technique with subs - mention away
        else {
            matchLocations = "Description / SubTechniques";
        }

        additionalMatches = sanitizer.sanitize(
            `<p class="ans-additional-matches"><i>
        <u>Matches in ${matchLocations}:</u> ${_.join(answer.highlights.additional, ", ")}
        </i><p>`);
        console.log("additionalMatches: " + additionalMatches);

        // console.log('`<p class="ans-additional-matches"><i><u>Matches in ${matchLocations}:</u> ${_.join(answer.highlights.additional, ", ")}</i><p>`: ' + `<p class="ans-additional-matches"><i><u>Matches in ${matchLocations}:</u> ${_.join(answer.highlights.additional, ", ")}</i><p>`)
        // console.log('sanitizer.sanitize(`<p class="ans-additional-matches"><i><u>Matches in ${matchLocations}:</u> ${_.join(answer.highlights.additional, ", ")}</i><p>`): ' + sanitizer.sanitize(`<p class="ans-additional-matches"><i><u>Matches in ${matchLocations}:</u> ${_.join(answer.highlights.additional, ", ")}</i><p>`))
    }

    return sanitizer.sanitize(`
        <div class="card answer box is-flex-grow-1" data-tech-id="${answer.id}">
            <div class="columns">
                <div class="column">
                    <a target="_blank" rel="noreferrer noopener" class="ans-url" href="${answer.url}">
                        <span class="ans-label">${answer.name} (${answer.id})</span>
                        <span class="icon is-small">
                            <i class="mdi mdi-link"></i>
                        </span>
                    </a>
                </div>
                <div class="column is-narrow count-column">
                    <a>
                        <p class="ans-num">
                            <span class="icon is-small equal-height">
                                <i class="mdi mdi-file-tree-outline"></i>
                            </span>
                            ${answer.num}
                        </p>
                    </a>
                </div>
            </div>

            <div class="card-content">
                <a class="ans-path" href="${answer.path}">
                    <!-- <p class="is-size-5 ans-text">answer.text</p> -->
                    <div class="md-content ans-content is-size-5">
                        ${answer.content}
                    </div>
                    ${additionalMatches}
                </a>
            </div>
        </div>
    `);
}

function pageButtonTemplate(page_num, is_current) {
    console.log("page_num: " + page_num);
    console.log("is_current: " + is_current);
    if (is_current) {
        // console.log('`<button class="pagination-link is-current">${page_num}</button>`: ' + `<button class="pagination-link is-current">${page_num}</button>`)
        // console.log('sanitizer.sanitize(`<button class="pagination-link is-current">${page_num}</button>`): ' + sanitizer.sanitize(`<button class="pagination-link is-current">${page_num}</button>`))

        return sanitizer.sanitize(`<button class="pagination-link is-current">${page_num}</button>`);
    } else {
        return sanitizer.sanitize(`<button class="pagination-link" onclick="gotoAnswerPage(${page_num})">${page_num}</button>`);
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// Page interaction callbacks: filtering & search

const questionUpdateSearchString = _.debounce(function (search_str) {
    console.log("search_str: " + search_str);
    console.log("questionUpdateSearchString: " + questionUpdateSearchString);
    // clear status (for backend, not present for front-end)
    if ($("#ans-search-status").length) {
        $("#ans-search-status").html("");
    }

    // run search
    console.log("question.search_str: " + question.search_str);
    question.search_str = search_str;
    questionRender();
}, 200);

const questionClearPlatforms = _.debounce(function () {
    clearFilters("platform");
    questionRender();
}, 50);

const questionUpdatePlatforms = _.debounce(function (checkbox) {
    updateFilters("platform", checkbox);
    questionRender();
}, 50);

const questionClearDataSources = _.debounce(function () {
    clearFilters("data_source");
    questionRender();
}, 50);

const questionUpdateDataSources = _.debounce(function (checkbox) {
    updateFilters("data_source", checkbox);
    questionRender();
}, 50);

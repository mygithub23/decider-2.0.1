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
    console.log("--------------------------- trace document ready----------------------");
    console.trace();
    $(window).on("resize", debounced_platformMatchHeight); // matches platform panel even after content reflow

    let version_v_strip = Math.floor(parseFloat($("#versionSelect").val().replace("v", "")));
    if (version_v_strip >= 10) {
        $("#dataSourceSelect").show();
    } else {
        $("#dataSourceSelect").hide();
    }

    initAnswerCards();
});


const debounced_platformMatchHeight = _.debounce(platformMatchHeight, 150);

function platformMatchHeight() {
    // aligns platform filter column to height of answer cards
    console.log("-----------------Start trace -debounced_platformMatchHeight--------------------------");
    console.trace(platformMatchHeight);
    console.log("----------------- End trace debounced_platformMatchHeight---------------------------");

    const navBar = $(".navbarSection");
    const navTop = navBar.position().top;
    const navHeight = navBar.outerHeight(true);

    const ansHeader = $("#answerListHeader");
    const ansHeaderBottom = ansHeader.position().top + ansHeader.outerHeight(true);

    $("#filterSpacing").height(ansHeaderBottom - (navTop + navHeight));
}

function initAnswerCards() {
    console.log("-----------------Start trace initAnswerCards---------------------------");
    console.trace();
    console.log("----------------- End trace initAnswerCards---------------------------");
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
            const sanitized = sanitizer.sanitize(JSON.stringify(answers, false))
            if (sanitized) {
                for (let i = 0; i < answers.length; i++) {
                    answers[i].score = -i;
                    answers[i].label = `${answers[i].name} (${answers[i].id})`;
                    answers[i].highlights = {};
                    answers[i].content_text = $(answers[i].content).text();

                    score = answers[i].score ;
                    label = answers[i].label;
                    highlights = answers[i].highlights ;
                    highlights2 =  answers[i].highlights;
                    content_text = answers[i].content_text ;

                    console.log("score: " + score + ", label: " + label + ", highlights: " + highlights + ", content_text: " + content_text + "/n"); 
                }                
            } else {
                console.log("sanitizer.sanitize(JSON.stringify(answers, false)) is not sanitized xxxxxxxxxxxxxxxxxxxxxxxx")
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
    console.log("-----------------Start trace templateAndHighlightAnswer---------------------------");
    console.log("templateAndHighlightAnswer(ans_data): ");
    console.trace(ans_data)

    console.log("----------------- End trace templateAndHighlightAnswer ---------------------------");
    // Render card with template
    console.log("answerTemplate(ans_data)")
    console.log(answerTemplate(ans_data))

    var ans_card = $(answerTemplate(ans_data));
 
    console.log("ans_data: ") 
    console.log(ans_data)
    console.log(JSON.stringify(ans_data))

        // Highlight label and content sections for matched terms
    if ("label" in ans_data.highlights) {
        console.log('"label" in ans_data.highlights) ')
        ans_card.find(".ans-label").mark(ans_data.highlights.label, question.markjs_opts);

    }
        
    if ("content_text" in ans_data.highlights) {
        console.log('"content_text" in ans_data.highlights) ')
        ans_card.find(".ans-content").mark(ans_data.highlights.content_text, question.markjs_opts);
    }
        
 
    // if (answerTemplate(ans_data)) {
    //     if ("label" in ans_data.highlights)
    //         ans_card.find(".ans-label").mark(ans_data.highlights.label, question.markjs_opts);
    //     if ("content_text" in ans_data.highlights)
    //         ans_card.find(".ans-content").mark(ans_data.highlights.content_text, question.markjs_opts);
    // } else {console.log("sanitizer.sanitize(answerTemplate(ans_data)), false)  is not true xxxxxxxxxxxxxxxxxxxxxxx")}    
    console.log("ans_data: ") 
    console.log(ans_data)
    console.log(JSON.stringify(ans_data))  
    console.log("return ans_card: ") 
    console.table(ans_card);

    return ans_card;
}

function gotoAnswerPage(page_num) {
    console.log("-----------------Start trace gotoAnswerPage ---------------------------");
    console.log("gotoAnswerPage(page_num): " ) 
    console.trace(page_num);
    console.log("----------------- End trace gotoAnswerPage ---------------------------");

    const PER_PAGE = 5; // Configurable
    const answers_view = question.answer_view;
    console.log("gotoAnswerPage(page_num): " + page_num);


    // Start page has content changed in-place: gotoAnswerPage(1) is called on page load
    if (question.index === "start") {
        // Holds all answer cards
        const sanitized  = sanitizer.sanitize("<div></div>")
        const grid1 = "<div></div>";
        // For all answer cards we have
        if (sanitized) {
            const grid =  $(grid1);
        // For all answer cards we have
            for (var i = 0; i < answers_view.length; i++) {
                // Create a new row for each 3 cards, add to master holder
                if (i % 3 === 0) {
                    var row = $('<div class="columns"></div>');
                    console.log("row:  ") 
                    console.table(row);
                    const map = new Map(Object.entries(row));
                    console.log(map)
                    grid.append(row);
                }

                // Wrap answer card with column div
                var piece = $('<div class="column is-one-third tactic-column"></div>');
                console.log("piece: ") 
                console.table(piece);
                console.log(Object.assign({}, piece));
                
                
                const map = new Map(Object.entries(piece));
                console.log(map)
                piece.append(templateAndHighlightAnswer(answers_view[i]));

                // Add chunk to current row
                grid.children().last().append(piece);
            }

            $("#answer-list").empty();
            $("#answer-list").append(grid);

            return;
        } else {
            console.log("gotoAnswerPage is not True xxxxxxxxxxxxxxxxxxxxxxx");
            return;
        }
    }
        

    // [Answer Cards] Get answer data, trim to current view, clear cards, repopulate
    const current_answers = _.slice(answers_view, PER_PAGE * (page_num - 1), PER_PAGE * page_num);    
    const answer_list = $("#answer-list");
    answer_list.empty();
    _.forEach(current_answers, function (ans_data) {
        answer_list.append(templateAndHighlightAnswer(ans_data));
    });

    // [Page Nav Bar] Calc total # of pages, fill list with page buttons, clear current, repopulate
    var total_pages = Math.ceil(answers_view.length / PER_PAGE);
    var page_list = $("<ul>", { class: "pagination-list" });
    for (var cur_page = 1; cur_page <= total_pages; cur_page++) {
        page_list.append($(pageButtonTemplate(cur_page, cur_page === page_num)));
    }
    var answer_nav = $("#answer-nav");
    answer_nav.empty();
    answer_nav.append(page_list);

    // const total_pages = Math.ceil(answers_view.length / PER_PAGE);
    // console.log("total_pages: " + total_pages);
    // const page_list = $(sanitizer.sanitize("<ul>", { class: "pagination-list" }));

    // if (sanitizer.sanitize("<ul>", { class: "pagination-list" })){
    //     for (var cur_page = 1; cur_page <= total_pages; cur_page++) {
    //         page_list.append($(pageButtonTemplate(cur_page, cur_page === page_num)));
    //     }
    // } else { console.log ("pagination-list is not True xxxxxxxxxxxxxxxxxxxxxxx"); }

    
}

function questionRenderFrontendSearch(answer_data) {
    console.log("-----------------Start trace questionRenderFrontendSearch ---------------------------");
    console.log("questionRenderFrontendSearch(answer_data): " )
    console.trace(answer_data);
    console.log("----------------- End trace questionRenderFrontendSearch ---------------------------");


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
    console.log("-----------------Start trace questionRenderBackendSearchRequest---------------------------");
    console.trace("questionRenderBackendSearchRequest(answer_data): " , answer_data);
    console.log("----------------- End trace -questionRenderBackendSearchRequest --------------------------");

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
    console.log("-----------------Start trace ---------------------------");
    console.trace("questionRenderBackendSearchResponse(answer_data, searchResponse): " , answer_data);
    console.trace("questionRenderBackendSearchResponse(answer_data, searchResponse): " , searchResponse);
    console.log("----------------- End trace ---------------------------");

    console.log("questionRenderBackendSearchResponse - answer_data): " )
    console.log(answer_data);
    console.log("questionRenderBackendSearchResponse- searchResponse ): ") 
    console.log(searchResponse);
    // search successful
    if ("results" in searchResponse) {
        // there were results -> set status and re-order / highlight cards
        if (Object.keys(searchResponse.results).length > 0) {       
            // if (sanitizer.sanitize(`<b>Search Used:</b> ${searchResponse.status}`)) {
            $("#ans-search-status").html(`<b>Search Used:</b> ${searchResponse.status}`);
            // } else {console.log("searchResponse is not true xxxxxxxxxxxxxxxxxxxx")}
            
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
            // no matches found -> just set status
        }  else {
            $("#ans-search-status").html(`
                <b>Search Used:</b> ${searchResponse.status}<br>
                <span style="color: red;"><i>No matches - cards will stay in their default order</i></span>
            `);
        }          
        question.answer_view = answer_data;
        gotoAnswerPage(1);
        
        console.log("answer_data: " + answer_data);
        console.log("answer_data.length: " + answer_data.length);
        console.log("question.answer_data: " + question.answer_data);

    // bad search query
    }else {
        // display error status in red
        $("#ans-search-status").html(`<span style="color: red;">${searchResponse.status}</span>`);

        // don't re-order / highlight answers
        question.answer_view = answer_data;
        gotoAnswerPage(1);
    }



            // no matches found -> just set status
        // else {
        //     if ( sanitizer.sanitize($("#ans-search-status").html(`
        //             <b>Search Used:</b> ${searchResponse.status}<br>
        //             <span style="color: red;"><i>No matches - cards will stay in their default order</i></span>
        //         `))) 
        //     {
        //         $("#ans-search-status").html(`
        //             <b>Search Used:</b> ${searchResponse.status}<br>
        //             <span style="color: red;"><i>No matches - cards will stay in their default order</i></span>
        //         `);
        //     }
        // }
                
    //     if (sanitizer.sanitize($("#ans-search-status").html(`<span style="color: red;">${searchResponse.status}</span>`))) 
    //     {
    //         $("#ans-search-status").html(`<span style="color: red;">${searchResponse.status}</span>`);
    //     // don't re-order / highlight answers
    //         console.log("answer_data: " + answer_data);
    //         console.log("answer_data.length: " + answer_data.length);
    //         console.log("question.answer_data: " + question.answer_data);
    //         question.answer_view = answer_data;
    //         gotoAnswerPage(1);
    //     } else {console.log('#ans-search-status").html(`<span style="color: red;">${searchResponse.status}</span> is not true xxxxxxxxxxxxxxxxxxxx');}
    // }

}

function questionRender() {
    console.log("-----------------Start trace questionRender---------------------------");
    console.trace(JSON.parse(JSON.stringify(question.answer_data)));
    console.log("----------------- End trace questionRender ---------------------------");

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
    console.log("-----------------------Start trace answerTemplate------------------------");
    console.trace("answerTemplate", answer);
    console.log("------------------------ End trace answerTemplate--------------------");
    // form additional matches section if present and 1+ matches exist
    console.log("answer table: \n")
    console.table(answer);
    console.log("answer: \n")
    console.log(answer);
    console.log('answer.highlights \n') 
    console.log(answer.highlights)
    // console.log(`answer.highlights.additional.length \n ${answer.highlights.additional.length}`);

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

        additionalMatches = `<p class="ans-additional-matches"><i>
        <u>Matches in ${matchLocations}:</u> ${_.join(answer.highlights.additional, ", ")}
        </i><p>`;
        
        console.log("additionalMatches: " + additionalMatches);
    }

    const sanitized = sanitizer.sanitize(`
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
    if (sanitized){
        return `
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
        `;
    } else { console.log("additionalMatches: " + additionalMatches + " is not true xxxxxxxxxxxxxxxxxxxx"); }
}

function pageButtonTemplate(page_num, is_current) {
    console.log("-----------------------------Start trace pageButtonTemplate-----------------------------");
    console.trace("pageButtonTemplate", page_num);
    console.trace("pageButtonTemplate", is_current);
    console.log("------------------------------- End trace pageButtonTemplate-------------------------------");
    console.log("page_num: " + page_num);
    console.log("is_current: " + is_current);

    const sanitized = `<button class="pagination-link is-current">${page_num}</button>`;

    if (sanitized) {
        if (is_current) {
            return `<button class="pagination-link is-current">${page_num}</button>`;
        } else {
            return `<button class="pagination-link" onclick="gotoAnswerPage(${page_num})">${page_num}</button>`;
        }
    } else {
        console.log("pagination-link 2 is not true xxxxxxxxxxxxxxxxxxxxxxx");
    }
}

// ------------------------
// Page interaction callbacks: filtering & search

const questionUpdateSearchString = _.debounce(function (search_str) {
    console.log("--------------------Start trace questionUpdateSearchString -----------------------");
    console.trace("questionUpdateSearchString", search_str);
    console.log("------------------- End trace questionUpdateSearchString ----------------------");

    if ($("#ans-search-status").length) {
        $("#ans-search-status").html("");
    }

    // run search
    console.log("search_str: " + search_str);
    console.log("question.search_str: ")
    console.log(question.search_str);


    // run search
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

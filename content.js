// Made by 김뀨뀨
//import { toDoList } from "./list.js"

const toDoList =
[

]

const cuk_URI = "https://e-cyber.catholic.ac.kr/ilos/main/main_form.acl"
const course_URI = "https://e-cyber.catholic.ac.kr/ilos/st/course/submain_form.acl"
const online_lecture_URI = "https://e-cyber.catholic.ac.kr/ilos/st/course/online_list_form.acl"
const online__view_URI = "https://e-cyber.catholic.ac.kr/ilos/st/course/online_view_form.acl"

let streaming_lecture = null
let streaming_time = 0

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function time_to_seconds(time) {
    const time_to_string = time.value[0]
    const [hours, minutes, seconds] = time_to_string.split(':').map(Number)
    let iterator = 1
    let res = 0

    if (seconds !== undefined) {
        res += seconds * iterator
        iterator *= 60
    }

    if (minutes !== undefined) {
        res += minutes * iterator
        iterator *= 60
    }

    if (hours !== undefined) {
        res += hours * iterator
        //iterator *= 24
    }

    return res
}

function cuk_main() {
    console.log(`${cuk_URI} connected`);

    var lectures = Array.from(document.getElementsByClassName("sub_open"))

    if (toDoList.length == 0) {
        lectures.filter(element => {
            for (const lectureName of toDoList){
                if (element.innerHTML.includes(lectureName)){
                    return true
                }
            }
            return false
        })
    }
}

function course() {
    window.location.href = online_lecture_URI
}

async function online_lecture() {
    //debugger;
    let weekly_lectures = document.getElementsByClassName("ibox3 wb wb-on ")

    for (weekly_lecture_element of weekly_lectures) {

        // complete weekly lectures
        if (weekly_lecture_element.innerHTML.includes("1/1")) {
            continue
        }
        
        weekly_lecture_element.click()

        // find element 10 times for 3 seconds
        for (let i = 1; i <= 10; i++) {
            console.log(i)
            await delay(300)
            let lecture_form = document.getElementById("lecture_form")

            const is_good_to_go = 
            !lecture_form.innerText.includes("학습 기간이 아닙니다.") 
            && 
            lecture_form.getElementsByClassName('loader').length == 0;
    
            if (is_good_to_go) {
                let lecture_list = lecture_form.getElementsByClassName("lecture-box")
                console.log(lecture_list)
                parse_lectures(lecture_list)
                break
            }
        }

        if (streaming_lecture !== null && streaming_time != 0) {
            break
        }
    }
}

function parse_lectures(lecture_list) {
    for (lecturebox of lecture_list) {
        const view_buttons = lecturebox.getElementsByClassName("site-mouseover-color")
        const per_text = lecturebox.querySelectorAll("#per_text")

        for (let i = 0; i < view_buttons.length; i++) {
            const view_button = view_buttons[i]

            const dates = lecturebox.innerHTML.matchAll(/\d{12}/g)
            const start_date = dates.next()
            const now_date = dates.next()
            const end_date = dates.next()

            if (now_date < start_date || now_date > end_date) {
                break
            }
            
            const per_text_now = per_text[i].innerText
            const percentage = per_text_now.match(/\d+/)[0]

            if (percentage > 95) {
                continue
            }

            const remained_seconds = calcutate_remained_seconds(i, lecturebox)
            streaming_lecture = view_button
            streaming_time = remained_seconds

            
            if (streaming_lecture !== null && streaming_time != 0){
                start_streaming()
                break
            }
        }
    }
}

function calcutate_remained_seconds(idx, lecturebox) {
    const lecture_html = lecturebox.innerHTML
    let remained_second = 0
    const regex_time = /(\d+):(\d{2}):(\d{2})|(\d{1,2}):(\d{2})(?!\d)/g     // "HH:MM:SS or MM:SS"
    const time_format_iterator = lecture_html.matchAll(regex_time)

    for (var i = 0; i < 2; i++){
        time_format_iterator.next()
    }

    // skip to present lecture time
    for (var i = 0; i < idx; i++) {
        time_format_iterator.next()
        time_format_iterator.next()
    }

    const time_took = time_format_iterator.next()
    const time_remained = time_format_iterator.next()

    if (time_took.done == true || time_remained.done == true){
        console.log("What")
        return 0
    }

    remained_second = time_to_seconds(time_remained) - time_to_seconds(time_took)

    console.log(`remained: ${remained_second}`)

    return (remained_second > 0)? remained_second : 0
}

function start_streaming() {
    chrome.runtime.sendMessage({remained_second: streaming_time}, function(response) {
        console.log(response.message);
    });

    streaming_lecture.click()
}

if (window.location.href == cuk_URI) {
    if (confirm("나무나무를 시작하시겠습니까?")){
        localStorage.setItem('isExtensionOn', JSON.stringify(true))
    }
    else {
        localStorage.setItem('isExtensionOn', JSON.stringify(false))
    }

    if (JSON.parse(localStorage.getItem('isExtensionOn')) == true){
        cuk_main()
        easterEgg()
    }
}

if (window.location.href == course_URI) {
    if (JSON.parse(localStorage.getItem('isExtensionOn')) == true) {
        course()
    }
}

if (window.location.href.includes(online_lecture_URI)) {
    if (JSON.parse(localStorage.getItem('isExtensionOn')) == true) {
        online_lecture()
    }
}

if (window.location.href.includes(online__view_URI)) {
    if (JSON.parse(localStorage.getItem('isExtensionOn')) == true) {
        chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
            if (message === 'course_done') {
                console.log("Done")
                const exit_button = document.getElementById("close_")
                exit_button.click()
            }
        })
    }
}



function easterEgg() {
    const user_name = document.getElementById("user").innerHTML
    document.getElementById("user").innerHTML = "나무 심는 " + user_name
}
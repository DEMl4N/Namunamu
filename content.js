// Made by 김뀨뀨

const cuk_URI = "https://e-cyber.catholic.ac.kr/ilos/main/main_form.acl"
const course_URI = "https://e-cyber.catholic.ac.kr/ilos/st/course/submain_form.acl"
const online_lecture_URI = "https://e-cyber.catholic.ac.kr/ilos/st/course/online_list_form.acl"
const online_view_URI = "https://e-cyber.catholic.ac.kr/ilos/st/course/online_view_form.acl"

let streaming_lecture = null
let streaming_time = 0

let toDoList = []

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

    let lecture_id_list = []
    let lectures = Array.from(document.getElementsByClassName("sub_open"))

    if (toDoList.length != 0) {
        lectures.filter(element => {
            for (const lectureName of toDoList){
                if (element.innerHTML.includes(lectureName)){
                    return true
                }
            }
            return false
        })
    }

    for (lecture of lectures) {
        lecture_id_list.push(lecture.innerText)
    }

    sessionStorage.setItem("lecture_id_list", JSON.stringify(lecture_id_list))
}

function course() {
    const title = document.querySelector(".welcome_subject").innerText
    const lecture_id = title.match(/\((.*?)\)/)[0]
    sessionStorage.setItem("lecture_id", JSON.stringify(lecture_id))
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

        // find element 5 times for 1 second
        for (let i = 1; i <= 5; i++) {
            console.log(i)
            await delay(200)
            let lecture_form = document.getElementById("lecture_form")

            const is_early = lecture_form.innerText.includes("학습 기간이 아닙니다.") 
            const is_loading = lecture_form.getElementsByClassName('loader').length > 0;

            if (is_loading) {
                continue
            }

            if (is_early) {
                break
            }
    
            let lecture_list = lecture_form.getElementsByClassName("lecture-box")
            console.log(lecture_list)
            parse_lectures(lecture_list)
            break

        }

        if (streaming_lecture !== null && streaming_time != 0) {
            break
        }
    }

    // no more lecture in this course
    if (streaming_lecture === null) {
        // open subject
        document.querySelector("#subject-span").click()
        delay(300)
        let subject_room = document.querySelector("#subject_room")
        
        const lecture_id = JSON.parse(sessionStorage.getItem("lecture_id"))
        const lecture_id_list = JSON.parse(sessionStorage.getItem("lecture_id_list"))

        const new_lecture_id_list = lecture_id_list.filter(element => !element.includes(lecture_id))
        sessionStorage.setItem("lecture_id_list", JSON.stringify(new_lecture_id_list))

        if (new_lecture_id_list.length == 0) {
            alert("전 강의 수강 완료")
            return
        }

        const next_lecture_id = new_lecture_id_list[0].match(/\((.*?)\)/)[0]
        const lecture_rooms = document.getElementsByClassName("roomGo")

        for (room of lecture_rooms) {
            if (room.innerText.includes(next_lecture_id)) {
                room.click()
            }
        }

         console.log("강의가 왜 없지")
    }
}

function online_view() {
    let running_time = JSON.parse(sessionStorage.getItem("streaming_time"))
    running_time = (running_time !== null)? running_time : 0;

    // ignore time checking message
    function confirm() { return true }
    inject_code(confirm)

    /*
    setTimeout(() => {
        chrome.runtime.sendMessage({type: "executeCode", code: "window.confirm = function(message){ return true }; console.log('HI')"}, function(response) {
                console.log(response.message);
        })}, 1000
    )
    */

    console.log(running_time)
    setTimeout(() => {
        const exit_button = document.getElementById("close_")
        exit_button.click()
    }, running_time * 1000)
}

function parse_lectures(lecture_list) {
    for (lecturebox of lecture_list) {
        const view_buttons = lecturebox.getElementsByClassName("site-mouseover-color")
        const per_text = lecturebox.querySelectorAll("#per_text")

        for (let i = 0; i < view_buttons.length; i++) {
            const view_button = view_buttons[i]

            const dates = lecturebox.innerHTML.matchAll(/\d{12}/g)
            const end_date = dates.next().value[0]
            const now_date = dates.next().value[0]

            if (now_date > end_date) {
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
    console.log("*(^u^)*");
    sessionStorage.setItem("streaming_time", JSON.stringify(streaming_time))
    streaming_lecture.click()
}

function inject_code(code) {
    let code_injection = "" + code + ""
    let script = document.createElement('script');

    script.textContent = code_injection;
    (document.body||document.documentElement).appendChild(script);
    script.remove();
}

if (window.location.href == cuk_URI) {
    if (confirm("나무나무를 시작하시겠습니까?")){
        sessionStorage.setItem('isExtensionOn', JSON.stringify(true))
    }
    else {
        sessionStorage.setItem('isExtensionOn', JSON.stringify(false))
    }

    if (JSON.parse(sessionStorage.getItem('isExtensionOn')) == true){
        cuk_main()
        easterEgg()
    }
}

if (window.location.href == course_URI) {
    if (JSON.parse(sessionStorage.getItem('isExtensionOn')) == true) {
        course()
    }
}

if (window.location.href.includes(online_lecture_URI)) {
    if (JSON.parse(sessionStorage.getItem('isExtensionOn')) == true) {
        online_lecture()
    }
}

if (window.location.href.includes(online_view_URI)) {
    if (JSON.parse(sessionStorage.getItem('isExtensionOn')) == true) {
        online_view()
    }
}


////////////////////////////// *(^u^)* \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function easterEgg() {
    const user_name = document.getElementById("user").innerHTML
    document.getElementById("user").innerHTML = "나무 심는 " + user_name
}

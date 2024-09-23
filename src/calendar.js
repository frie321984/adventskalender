const DEBUG_FLAG = !!localStorage.getItem('frie321984.adventskalender.debug');
if (DEBUG_FLAG) console.log('debugging ist ON')

const adventcalendar = 'adventcalendar';
const adventDoors = 'adventDoors';
const overlay = "adventOverlay";
const EVENT_OPEN_DOOR = 'openDoor';
const EVENT_ERROR = 'error';
const EVENT_CLOSE = 'close';

const defaultImgPathFn = (day) => 'images/' + day + ".jpg"

genDoorId = (day) => day > 0 && day < 32 ? "door" + day : undefined;
preload = (url) => {
    let im = new Image()
    im.src = url // this starts the preloading in the browser
    return im // return for testability
}
byId = (id, doc = document) => doc.getElementById(id)
a = (d) => d.getElementsByTagName('button')[0]
img = (el) => el.getElementsByTagName('img')[0]
setup=(loadingUrl, orderOfDoor = (position => position), doc=document)=>{
    if (byId(adventcalendar) !== undefined && byId(adventcalendar) !== null) {
        const overlayNode = doc.createElement('div')
        overlayNode.id = overlay;
        overlayNode.classList.add('hidden')
        overlayNode.innerHTML = '<div class="wrapper"><span class="xToClose">X</span><img src="'+loadingUrl+'" /></div>';
        const calendarNode = doc.createElement('ul')
        calendarNode.id = adventDoors
        byId(adventcalendar).append(overlayNode)
        byId(adventcalendar).append(calendarNode)
    }

	img(byId(overlay)).tabIndex=0
    for (let position = 1; position <= 24; position++) {
        const day = orderOfDoor(position)
		const door = doc.createElement("li");
		byId(adventDoors).appendChild(door);
		door.id = genDoorId(day);

		const link = doc.createElement("button");
		link.innerHTML += day;
		link.tabIndex=0
		door.appendChild(link);
	}
}

const addClickabilityDependingOnNowAndDEBUG_FLAG = (li = {id: 'door12', a: undefined, day: 12}, now = new Date(), shouldDebug = DEBUG_FLAG) => {
    const d = li.day;
    const dbgRule = d <= 24;
    const defaultRule = now.getMonth() >= 11 && d <= now.getDate()
    return {...li, clickable: shouldDebug ? dbgRule : defaultRule}
}

const allDoorsFUN = (doc = document, imgUrlFn = defaultImgPathFn) => Array.from(doc.querySelectorAll('li'))
    .map(link => ({li: link, id: link.id, a: link.querySelector('button')}))
    .map(link => ({ ...link, day: link.a.innerText }))
    .map(x => addClickabilityDependingOnNowAndDEBUG_FLAG(x))
    .map(x => ({...x, imgPath: imgUrlFn(x.day)}))

const allClickableDoors = (doc = document, imgUrlFn = defaultImgPathFn) => allDoorsFUN(doc, imgUrlFn)
    .filter(x => x.clickable)

const hide = elem => {
    elem.classList.add('hidden')
    return elem
}
const show = elem => {
    elem.classList.remove('hidden')
    return elem
}
function composeAll(...fns) {
    return x => fns.reduce(
        (res, f) => f(res),
        x
    );
}
const tap = fn => p => p.then(x => { fn(x); return x; });
const map = fn => p => p.then(x => { return fn(x); });
const onError = fn => p => p.catch(fn)
const noop = () => {}

closeOverlayFUN = loadingUrl => (overlayElement = byId(overlay))=> {
    composeAll(
        map(x => {
            if (x.classList.contains('hidden')) {return Promise.reject('already hidden')}
            return  Promise.resolve(x)
        }),
        tap(_ => console.log('hiding')),
        tap(hide),
        map((el) => {
            return {element: el, img: el.getElementsByTagName('img')[0]}
        }),
        tap((x) => {
            x.img.src = loadingUrl
        }), // STATE CHANGE
        tap(console.log),
        onError(noop)
    )(Promise.resolve(overlayElement))
}

main= (
    loadingUrl = 'images/loading.jpg',
    imgUrlFn = (day) => 'images/'+day+'.jpg',
    doorOrder = (pos) => [12, 3, 19, 8, 23, 6, 15, 1, 17, 24, 10, 4, 20, 14, 7, 22, 9, 2, 11, 18, 21, 5, 13, 16][pos-1]
) => {
    const pubsub = createPubSub()
    setup(loadingUrl, doorOrder);

    document.addEventListener('keydown', (ev) => {
        if (ev.key.toUpperCase()==="ESCAPE")
            pubsub.pub(EVENT_CLOSE)
    })

    byId(overlay).addEventListener('click', _ => pubsub.pub(EVENT_CLOSE))

    const showMiniImageFUN = (x) => {
        const link = x.a
        link.classList.add('opened')
        setTimeout(
            () => link.style = "background-image: url('" + imgUrlFn(x.day) + "'); background-size:cover; background-position: center;",
            500
        )
    }
    const doorIsClciked = (door) => composeAll(
        tap(console.log),
        map(door => {
            if (door.clickable) return Promise.resolve(door)
            return Promise.reject(door.day + ' not clickable!')
        }),
        tap(showMiniImageFUN),
        map(door => door.day),
        tap(day => pubsub.pub(EVENT_OPEN_DOOR, day)),
        onError(day => pubsub.pub(EVENT_ERROR, day)),
    )(Promise.resolve(door))

    pubsub.sub(EVENT_ERROR, console.error)

    pubsub.sub(EVENT_OPEN_DOOR, day => {
        composeAll(
            map((el) => {return {element: el, img: el.getElementsByTagName('img')[0], imgUrl: imgUrlFn(day)}}),
            tap((x) => {x.img.src = loadingUrl}), // STATE CHANGE
            tap(x => show(x.element)), // STATE CHANGE
            tap((x) => {x.img.src = x.imgUrl}), // STATE CHANGE
            onError(day => pubsub.pub(EVENT_ERROR, day)),
        )(Promise.resolve(byId(overlay)))
    })

    pubsub.sub(EVENT_CLOSE, closeOverlayFUN(loadingUrl))

    allDoorsFUN(document, imgUrlFn).forEach(door => {
        door.a.disabled = !door.clickable;
        if (!door.clickable) door.li.classList.add('disabled')
    })

    allClickableDoors(document, imgUrlFn).forEach(door => {
        door.li.addEventListener('click', event => doorIsClciked(door))
        door.li.addEventListener('keydown', (ev) => {
            if ([' ','ENTER'].includes(ev.key.toUpperCase())) doorIsClciked(door)
        })
    })

    allClickableDoors(document, imgUrlFn)
        .reverse()
        .map(x => x.imgPath)
        .forEach(preload)
}

const createPubSub = () => {
    let subscribers = {};

    const subscribe = (eventName, fn) => {
        subscribers = {
            ...subscribers,
            [eventName]: [...(subscribers[eventName] || []), fn]
        };
    };

    const publish = (eventName, data) => {
        (subscribers[eventName] || []).forEach(fn => fn(data));
    };

    return { sub: subscribe, pub: publish };
};

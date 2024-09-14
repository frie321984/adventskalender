const DEBUG_FLAG = !!localStorage.getItem('frie321984.adventskalender.debug');
if (DEBUG_FLAG) console.log('debugging ist ON')
console.log(DEBUG_FLAG)

const once={once:true}
const adventcalendar = 'adventcalendar';
const adventDoors = 'adventDoors';
const overlay = "adventOverlay";
const imagePath = "images/";
const loadingUrl = imagePath + 'loading.jpg';
const doc = document;
const arrayConstructor = Array;
genDoorId = (day) => day > 0 && day < 32 ? "door" + day : undefined;
preload = (url) => {
    let im = new Image()
    im.src = url // this starts the preloading in the browser
    return im // return for testability
}
// --------------------
byId = (id, doc = document) => doc.getElementById(id)
allDoors = (id = adventDoors, htmlElement = byId(id)) => htmlElement.getElementsByTagName('li')
// --------------------
a = (d) => d.getElementsByTagName('button')[0]
img = (el) => el.getElementsByTagName('img')[0]
xmasimgs= {
    1: '1.jpg',
    2: '2.jpg',
    3: '3.jpg',
    4: '4.jpg',
    5: '5.jpg',
    6: '6.jpg',
    7: '7.jpg',
    8: '8.jpg',
    9: '9.jpg',
    10: '10.jpg',
    11: '11.jpg',
    12: '12.jpg',
    13: '13.jpg',
    14: '14.jpg',
    15: '15.jpg',
    16: '16.jpg',
    17: '17.jpg',
    18: '18.jpg',
    19: '23.jpg',
    20: '19.jpg',
    21: '20.jpg',
    22: '21.jpg',
    23: '22.jpg',
    24: '24.jpg'
}
imgPath = (d) => {
    return imagePath + xmasimgs[day(d)];
};
day = (d) => a(d).text
clearEventHandlers = (el) => el.outerHTML = el.outerHTML

isDoorClickable = li => {
	const now = new Date();
	const d = day(li);
	const dbgRule = d <= 24;
	const defaultRule = now.getMonth() >= 11 && d <= now.getDate()
	return DEBUG_FLAG?dbgRule:defaultRule
}

showMiniImage=(tag)=>{
	const door = byId(genDoorId(tag))
	const link = a(door)
	link.classList.add('opened')
	setTimeout(
		() => link.style = "background-image: url('" + imgPath(door) + "'); background-size:cover;",
		500
	)
}

clickDoor = (clickedDoor)=>{
    !DEBUG_FLAG||console.debug('click')
    const tag = day(clickedDoor);
    !DEBUG_FLAG||console.debug(tag)
    let o = byId(overlay);

    img(o).src=clickedDoor.imgPath
    o.classList.remove('hidden')

    arrayConstructor.from(allDoors()).forEach(d => clearEventHandlers(d) )

    showMiniImage(tag);
    setTimeout(() => makeOverlayCloseable(), 500)
}

clickDoorFUN = (clickedDoor = {
    li: undefined,
    a: undefined,
    day: 12,
    id: 'door12',
    imgPath: 'loading.jpg',
    clickable: true
}, o = byId(overlay))=>{
    !DEBUG_FLAG||console.debug('click')
    const tag = clickedDoor.day;
    !DEBUG_FLAG||console.debug(tag)

    img(o).src=clickedDoor.imgPath
    o.classList.remove('hidden')

    arrayConstructor.from(allDoors()).forEach(d => clearEventHandlers(d) )

    showMiniImage(tag);
    setTimeout(() => makeOverlayCloseable(), 500)
}

makeDoorsClickable = () => {
	arrayConstructor.from(allDoorsFUN())
		.forEach(d => {
			d.li.addEventListener('click', () => clickDoorFUN(d), once)
			d.li.addEventListener('keydown', (ev) => {
				const k=ev.key.toUpperCase()
				if ([' ','ENTER'].includes(k)) clickDoor(d)
			})
		})
}
closeOverlay = (_, el = byId(overlay)) => {
	!DEBUG_FLAG||console.debug('close')
	el.classList.add('hidden')
	img(el).src = loadingUrl
	clearEventHandlers(el)
	setTimeout(makeDoorsClickable, 200)
}

makeOverlayCloseable = () => {
	byId(overlay).addEventListener('click', closeOverlay, once)
	byId(overlay).addEventListener('pointerdown', closeOverlay, once)
	img(byId(overlay)).addEventListener('keydown', (ev) => {
		if ([' ', 'ENTER', 'X'].includes(ev.key.toUpperCase())) closeOverlay()
	})
}
openAllDoors = () => !DEBUG_FLAG || arrayConstructor.from(allDoors())
    .filter(isDoorClickable)
    .forEach(li => showMiniImage(day(li)))

setupDevHud = () => {
    if (!DEBUG_FLAG) return;
    if (!byId("dev")) return;

    const openAllLink = doc.createElement("button")
    openAllLink.textContent = "Open all"
    openAllLink.addEventListener('click', () => openAllDoors(), once)
    openAllLink.addEventListener('keydown', (ev) => {
        const k = ev.key.toUpperCase()
        if ([' ', 'ENTER'].includes(k)) openAllDoors()
    })
    byId("dev").appendChild(openAllLink)
}

setup=(orderOfDoor = (position => position))=>{
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

main = () => {
    preload(loadingUrl)
    setup();
    doc.addEventListener('keydown', (ev) => {
        if (ev.key.toUpperCase()==="ESCAPE")
            closeOverlay()
    })
    closeOverlay()

    arrayConstructor.from(allDoors())
        .filter(d => !isDoorClickable(d))
        .forEach(d => {
            a(d).tabIndex=-1
            d.classList.add('disabled')
        })

    makeDoorsClickable()

    // preloading
    arrayConstructor.from(allDoors())
        .filter(isDoorClickable)
        .reverse()
        .forEach(li => preload(imgPath(li)))
}
//----------------------

const addClickabilityDependingOnNowAndDEBUG_FLAG = (li = {id: 'door12', a: undefined, day: 12}, now = new Date(), shouldDebug = DEBUG_FLAG) => {
    const d = li.day;
    const dbgRule = d <= now.getDate();
    const defaultRule = now.getMonth() >= 11 && d <= now.getDate()
    return {...li, clickable: shouldDebug ? dbgRule : defaultRule}
}

const allDoorsFUN = (doc = document) => Array.from(doc.querySelectorAll('li'))
    .map(link => ({li: link, id: link.id, a: link.querySelector('button')}))
    .map(link => ({ ...link, day: link.a.innerText }))
    .map(x => addClickabilityDependingOnNowAndDEBUG_FLAG(x))
    .map(x => ({...x, imgPath: 'images/' + x.day + ".jpg"}))

const allClickableDoors = (doc = document) => allDoorsFUN(doc)
    .filter(x => x.clickable)

const preloadAllImages = (doc = document) => allClickableDoors(doc)
        .reverse()
        .map(x => x.imgPath)
        .forEach(preload);

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

closeOverlayFUN = (overlayElement = byId(overlay))=> {
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

mainFun= (imgUrlFn = (day) => 'images/'+day+'.jpg') => {
    const pubsub = createPubSub()
    setup((pos) => {
        const randomArray = [12, 3, 19, 8, 23, 6, 15, 1, 17, 24, 10, 4, 20, 14, 7, 22, 9, 2, 11, 18, 21, 5, 13, 16];
        console.log(randomArray, randomArray[pos-1])
        return randomArray[pos-1]
    });

    document.addEventListener('keydown', (ev) => {
        if (ev.key.toUpperCase()==="ESCAPE")
            pubsub.pub('close')
    })

    byId(overlay).addEventListener('click', _ => pubsub.pub('close'))

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
        tap(day => pubsub.pub('openDoor', day)),
        onError(day => pubsub.pub('error', day)),
    )(Promise.resolve(door))

    pubsub.sub('error',             day => {
        const p = document.createElement('p')
        p.innerText = 'ERROR ' + day
        console.error(p.innerText)
        byId(adventcalendar).appendChild(p)
    })

    pubsub.sub('openDoor', day => {
        composeAll(
            map((el) => {return {element: el, img: el.getElementsByTagName('img')[0], imgUrl: imgUrlFn(day)}}),
            tap((x) => {x.img.src = loadingUrl}), // STATE CHANGE
            tap(x => show(x.element)), // STATE CHANGE
            tap((x) => {x.img.src = x.imgUrl}), // STATE CHANGE
            onError(day => pubsub.pub('error', day)),
        )(Promise.resolve(byId(overlay)))
    })

    pubsub.sub('close', closeOverlayFUN)

    allDoorsFUN().forEach(door => {
        door.a.disabled = !door.clickable;
        if (!door.clickable) door.li.classList.add('disabled')
    })

    allClickableDoors().forEach(door => {
        door.li.addEventListener('click', event => doorIsClciked(door))
        door.li.addEventListener('keydown', (ev) => {
            if ([' ','ENTER'].includes(ev.key.toUpperCase())) doorIsClciked(door)
        })
    })

    preloadAllImages(document)
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

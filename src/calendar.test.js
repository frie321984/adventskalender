const calendar = require('./calendar');

function givenSampleHtml(htmlString) {
    return new DOMParser().parseFromString(htmlString, 'text/html').getRootNode();
}

function givenDocumentBody(html) {
    document.body.innerHTML = html;
}

describe('calendar', () => {
    describe('genDoorId', () => {
        it('valid values 1-31', () => {
            expect(genDoorId(1)).toBe('door1');
            expect(genDoorId(31)).toBe('door31');
        })
        it('invalid values', () => {
            expect(genDoorId(32)).toBeUndefined();
            expect(genDoorId(0)).toBeUndefined();
            expect(genDoorId(-1)).toBeUndefined();
        })
        it('syntax errors will not throw', () => {
            expect(genDoorId()).toBeUndefined();
        })
    });

    describe('byId', () => {
        it('valid call', () => {
            givenDocumentBody(`
            <div id="validId"></div>
        `);
            expect(byId('validId')).toBeTruthy()
        })
    })

    describe('a link', () => {
        it('should get first link in an element', () => {
            const htmlElement = givenSampleHtml("<div><a>1</a><a>2</a></div>");
            expect(a(htmlElement)).toBeTruthy()
            expect(a(htmlElement).innerHTML).toEqual("1")
        })

        it('should fail on invalid call', () => {
            expect(() => a()).toThrow()
            expect(() => a(undefined)).toThrow()
            expect(() => a('string')).toThrow()
            expect(() => a(1234)).toThrow()
        })
    })

    describe('img', () => {
        it('should get first picture in an element', () => {
            const htmlElement = givenSampleHtml("<div><img src='1' /><img src='2' /></div>");
            expect(img(htmlElement)).toBeTruthy()
            expect(img(htmlElement).src).toEqual("1")
        })

        it('should fail on invalid call', () => {
            expect(() => img()).toThrow()
            expect(() => img(undefined)).toThrow()
            expect(() => img('string')).toThrow()
            expect(() => img(1234)).toThrow()
        })
    })

    describe('day', () => {
        it('how to find out day of an element', () => {
            const htmlElement = givenSampleHtml("<div><a>this-is-the-day</a></div>");
            expect(day(htmlElement)).toEqual("this-is-the-day")
        })
    })

    describe('allDoors', () => {
        it('valid call', () => {
            givenDocumentBody("<ul id='adventDoors'><li>1</li><li>2</li><li>3</li><li>4</li></ul>");
            expect(allDoors().length).toEqual(4)
        })
        it('no list items', () => {
            givenDocumentBody("<ul id='adventDoors'></ul>");
            expect(allDoors().length).toEqual(0)
        })
        it('id not found', () => {
            givenDocumentBody("<ul id='someOtherId'><li>1</li></ul>");
            expect(()=>allDoors()).toThrow()
        })
    })

    describe('clearEventHandlers', () => {
        it('valid call', () => {
            let element = givenSampleHtml('')
            element.outerHTML = '<button></button>'
            clearEventHandlers(element)
            expect(element.outerHTML).toEqual("<button></button>")
        })
    })
    describe('preload', () => {
        it('valid call', () => {
            expect(preload('foo')).toBeTruthy()
            expect(preload('imageName.jpg').src).toMatch(/imageName\.jpg$/)
        })
    })
});

describe('usage', () => {
    it('should create doors for calendar', () => {
        givenDocumentBody("<div id=\"adventOverlay\" class=\"hidden\">\n" +
            "<div class=\"wrapper\">\n" +
            "<span class=\"xToClose\">X</span>\n" +
            "<img src='loading.jpg' />" +
            "</div>\n" +
            "</div>\n" +
            "<ul id=\"adventDoors\"></ul>\n"
            );

        main()

        expect(document.getElementById('adventDoors').innerHTML).toContain('<li')
        expect(document.getElementById('adventDoors').innerHTML).toContain('door24')
        expect(document.getElementById('adventDoors').innerHTML).toContain('door1')
        expect(document.getElementById('adventOverlay').classList).toContain('hidden')
    })

    // TODO useful errors when html doesnt match expectations

    it('simpler setup: should create everything if nothing is there yet', () => {
        givenDocumentBody("<main id='adventcalendar'></main>");

        main()

        expect(document.getElementsByClassName('xToClode')).toBeTruthy()
        expect(document.getElementById('adventDoors')).toBeTruthy()
        expect(document.getElementById('adventOverlay')).toBeTruthy()
    })

})

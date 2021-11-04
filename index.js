class GloBar {
    constructor(initOptions = {}) {
        const defaultOptions = {
            bandwidthList: [],
            dom: null,
        };
        const options = {...defaultOptions, ...initOptions};
        this.template = 
        `<div class="globarWrapper">
            <datalist class="labels">
            </datalist>
            <input type="range" list="labels" class="bar" min="0" max="5000" step="1" value="0" >
        </div>`;
        this.bar = null;
        this.bandwidthList = options.bandwidthList;
        this.dom = options.dom;
        if(this.dom && this.bandwidthList.length > 0 ) {
            this.init(options);
        }
    }
  
    drawBar (options) {
        this.dom.insertAdjacentHTML('beforeEnd', this.template);
        this.bar = this.dom.querySelector('.bar');
        this.bar.value = parseInt(parseInt(this.bar.getAttribute('max')) / this.bandwidthList.length);
    }

    drawLabels () {
        const labels = this.dom.querySelector('.labels');
        let options = `<option value="0" label="0"></option>`;
        this.bandwidthList.forEach((item, index) => {
            options += `<option value="${item.value}" label="${item.label}"></option>`;
        });
        labels.insertAdjacentHTML('beforeEnd', options);
    }

    adjustPinPosition (currentPosition) {
        const sections = this.bandwidthList.length;
        let diffTmp = -1;
        let posIndex = sections;
        for (let i = 1; i <= sections; i ++) {
            const sectionPos = i / sections;
            const diff = Math.abs(currentPosition - sectionPos);
            if (diff > diffTmp && diffTmp !== -1) {
                posIndex = i - 1;
                break;
            }
            diffTmp = diff;
        }
        return Number.parseFloat(posIndex / sections).toPrecision(10);
    }

    movePin (pinPosition) {
        this.bar.value = parseInt(pinPosition * parseInt(this.bar.getAttribute('max')));
    }

    handleChange () {
        this.bar.addEventListener('change', (e) => {
            const currentPosition = parseInt(this.bar.value) / parseInt(this.bar.getAttribute('max'));
            this.movePin(this.adjustPinPosition(currentPosition));
        });
    }
    init (options) {
        this.drawBar(options);
        this.drawLabels();
        this.handleChange();
    }
}
const gloBar = new GloBar({
    dom: document.getElementById('globar'),
    bandwidthList: [{
        label: '10M', 
        value: 10,
        color: 'G'
    }, {
        label: '50M',
        value: 50,
        color: 'G'
    }, {
        label: '100M',
        value: 100,
        color: 'G'
    }, {
        label: '200M',
        value: 200,
        color: 'A'
    }, {
        label: '500M',
        value: 500,
        color: 'A'
    }, {
        label: '1GB',
        value: 1000,
        color: 'R'
    }, {
        label: '2GB',
        value: 2000,
        color: 'R'
    }],
});
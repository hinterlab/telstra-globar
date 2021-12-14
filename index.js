class GloBar {
    constructor(initOptions = {}) {
        const defaultOptions = {
            dom: null,
            barConfig: [],
        };
        const options = {...defaultOptions, ...initOptions};
        this.template = 
        `<div class="globarWrapper">
            <datalist class="labels">
            </datalist>
            <input type="range" list="labels" class="bar" min="0" max="1000000" step="1" value="0" />
            <div class="segments">
            </div>
        </div>`;
        this.value = null;
        this.index = null;
        this.bar = null;
        this.barConfig = options.barConfig;
        this.bandwidthList = [];
        options.barConfig.forEach(item => {
            this.bandwidthList = this.bandwidthList.concat(item.group);
        });
        const validBandwithCount = this.bandwidthList.reduce((prev, curr) => {
            if(curr.unselectable) {
                return prev;
            } else {
                return prev + 1;
            }
        }, 0);
        this.dom = options.dom;
        if(this.dom && this.bandwidthList.length > 0 && validBandwithCount > 0) {
            this.init(options);
        }
    }

    setBarVal (i) {
        this.bar.value = parseInt(parseInt(this.bar.getAttribute('max')) * (i + 1) / this.bandwidthList.length);
        this.bar.setAttribute('aria-valuenow', parseInt(this.bandwidthList[i].value));
        this.bar.setAttribute('aria-valuetext', this.bandwidthList[i].label);
        this.index = i;
    }
  
    drawBar () {
        this.dom.insertAdjacentHTML('beforeEnd', this.template);
        this.bar = this.dom.querySelector('.bar');

        const ariaValueMin = this.bandwidthList.reduce((prev, curr) => {
            if (parseInt(curr.value) < prev) {
                return parseInt(curr.value);
            } else {
                return prev;
            }
        }, Infinity);

        const ariaValueMax = this.bandwidthList.reduce((prev, curr) => {
            if (parseInt(curr.value) > prev) {
                return parseInt(curr.value);
            } else {
                return prev;
            }
        }, 0);

        this.bar.setAttribute('aria-valuemin', ariaValueMin);
        this.bar.setAttribute('aria-valuemax', ariaValueMax);

        for (let i = 0; i < this.bandwidthList.length; i ++) {
            if(this.bandwidthList[i].default) {
                this.setBarVal(i);
                break;
            }
        }
        if (this.index === null) {
            for (let i = 0; i < this.bandwidthList.length; i ++) {
                if(!this.bandwidthList[i].unselectable) {
                    this.setBarVal(i);
                    break;
                }
            }
        }
    }

    drawLabels () {
        const labels = this.dom.querySelector('.labels');
        let optionsHtml = `<option value="0" label="0"></option>`;
        this.bandwidthList.forEach((item) => {
            optionsHtml += `<option value="${item.value}" label="${item.label}"></option>`;
        });
        labels.insertAdjacentHTML('beforeEnd', optionsHtml);
    }

    drawColors () {
        let radialBg = '';
        let length = 0;
        for (let i = 0; i < this.barConfig.length; i ++) {
            if (i != this.barConfig.length - 1) {
                length += this.barConfig[i].group.length;
                radialBg += 'radial-gradient(' + this.bar.clientHeight + 'px circle at ' + Number.parseFloat(length / this.bandwidthList.length).toPrecision(10) * 100 + '% ' + (this.bar.clientHeight / 2) + 'px, ' + this.barConfig[i].color + ' 50%, transparent 51%),';
            }
        }

        let linearBg = this.barConfig[0].color + ' 0%,';
        length = 0;
        for (let i = 0; i < this.barConfig.length; i ++) {
            length += this.barConfig[i].group.length;
            linearBg += this.barConfig[i].color + ' ' + Number.parseFloat(length / this.bandwidthList.length).toPrecision(10) * 100 + '%,';
            if (i != this.barConfig.length - 1) {
                linearBg += this.barConfig[i + 1].color + ' ' + Number.parseFloat(length / this.bandwidthList.length).toPrecision(10) * 100 + '%,';
            }
        }
        linearBg = 'linear-gradient(90deg, ' + linearBg.slice(0, -1) + ')';
        this.bar.style.backgroundImage = radialBg + linearBg;
    }

    drawSegments () {
        const segments = this.dom.querySelector('.segments');
        this.barConfig.forEach((item) => {
            const span = document.createElement('span');
            span.innerText = item.text;
            const i = document.createElement('i');
            i.style.backgroundColor = item.color;
            span.insertBefore(i, span.firstChild);
            segments.appendChild(span);
        }); 
    }

    setValue(value) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

    adjustPinPosition (currentPosition) {
        const sections = this.bandwidthList.length;
        const diffs = this.bandwidthList.map((item, index) => {
            if (item.unselectable) {
                return Infinity;
            } else {
                return Math.abs(currentPosition - ((index + 1) / sections));
            }
        });
        let pinIndex = -1;
        diffs.reduce((prev, curr, index) => {
            if (curr < prev) {
                pinIndex = index;
                return curr;
            } else {
                return prev;
            }
        }, Infinity);

        this.setValue(this.bandwidthList[pinIndex].value);
        this.setBarVal(pinIndex);

        return Number.parseFloat((pinIndex + 1) / sections).toPrecision(10);
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

    handleKeyboard () {
        this.bar.addEventListener('keydown', (e) => {
            if (e.key == 'ArrowLeft') {
                let i = this.index - 1;
                while (i >= 0) {
                    if (this.bandwidthList[i].unselectable) {
                        i = i - 1;
                        continue;
                    } else {
                        this.setBarVal(i);
                        break;
                    }
                }
            } else if (e.key == 'ArrowRight') {
                let i = this.index + 1;
                while (i < this.bandwidthList.length) {
                    if (this.bandwidthList[i].unselectable) {
                        i = i + 1;
                        continue;
                    } else {
                        this.setBarVal(i);
                        break;
                    }
                }
            }
        });
    }

    init (options) {
        this.drawBar(options);
        this.drawLabels();
        this.drawColors();
        this.drawSegments();
        this.handleChange();
        this.handleKeyboard();
    }
}
const gloBar = new GloBar({
    dom: document.getElementById('globar'),
    barConfig: [{
        color: 'rgba(35,115,106,1)',
        group: [{
            label: '20MB',
            value: '20',
        }, {
            label: '100MB',
            value: '100',
            default: true,
        }, {
            label: '200MB',
            value: '200',
        }, {
            label: '250MB',
            value: '250',
            unselectable: true,
        }],
        text: 'G1 Device On-Net',
    }, {
        color: 'rgba(249,211,113,1)',
        group: [{
            label: '500MB',
            value: '500',
        }, {
            label: '1GE',
            value: '1000',
        }],
        text: 'Amber Fibre Near-Net',
    }, {
        color: 'rgba(207,54,72,1)',
        group: [{
            label: '2GE',
            value: '2000',
        }],
        text: 'Red Unable to determine',
    }],
});
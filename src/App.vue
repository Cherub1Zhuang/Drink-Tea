<template>
    <div class="add_task">
        <!-- 可以使用 CellGroup 作为容器 -->
        <van-cell-group inset class="task_group">
            <van-field v-model="task" label="任务" placeholder="请输入任务" class="task_field" />
            <van-field v-model="time" label="时间" placeholder="请输入时间" @click="showPicker = true" readonly
                class="task_field" />
            <van-popup v-model:show="showPicker" destroy-on-close position="bottom">
                <van-time-picker :model-value="pickerValue" @confirm="onConfirm" @cancel="showPicker = false"
                    :columns-type="columnsType" />
            </van-popup>
        </van-cell-group>
        <vant-cell-group inset class="btn_group">
            <van-button round type="danger" block @click="start" v-if="!is_counting">开始计时</van-button>
            <van-button round type="danger" block @click="stop" v-else>停止计时</van-button>
        </vant-cell-group>
        <div class="circle" v-if="rate > 0">
            <van-circle v-model:current-rate="currentRate" :rate="rate" :speed="300" :text="text"
                :color="gradientColor" />
        </div>
        <div class="image">
            <img src="./tea.png" alt="logo" :width="150" :height="150" />
        </div>
    </div>

</template>
<script setup>
import { ref, computed } from 'vue'

const task = ref('主人，茶已经煮好了！')
const time = ref('00:00:00')
const showPicker = ref(false)
const pickerValue = ref(['00', '15', '00'])
const columnsType = ['hour', 'minute', 'second']
const gradientColor = {
    '0%': '#3fecff',
    '100%': '#6149f6',
}

const is_counting = ref(false)

// 圆环进度条
let timer = null
let count = 0
const currentRate = ref(0)
const text = computed(() => currentRate.value.toFixed(0) + '%')
const rate = ref(0)
const onConfirm = ({ selectedValues }) => {
    console.log(selectedValues)
    pickerValue.value = selectedValues
    time.value = selectedValues.map(item => item).join(':')
    showPicker.value = false
    rate.value = 0

}
let audio = null
const shownotification = () => {
    let notification = null

    window.electronAPI.trayFlash('title', 'content')

    audio = new Audio('./audio/apt_full.mp3')
    audio.loop = true
    audio.play()
    window.electronAPI.onStopMusic(() => {
        audio.pause()          // 暂停音频播放
        audio.currentTime = 0  // 重置播放时间
        audio = null           // 清空 audio 对象
        console.log('音频已停止')
    })
}
const start = () => {
    is_counting.value = !is_counting.value
    count = 0
    currentRate.value = 0
    console.log(task.value, time.value)
    const parts = time.value.split(':').map(item => parseInt(item))
    const timerNumbers = parts.map(
        part => {
            const num = Number(part)
            return num
        }
    )
    const data = timerNumbers[0] * 3600 + timerNumbers[1] * 60 + timerNumbers[2]

    const update = () => {
        count++
        rate.value = (count / data) * 100
        if (count >= data) {
            is_counting.value = !is_counting.value
            shownotification()
            clearInterval(timer)
            timer = null
        }else{
            timer = setTimeout(update, 1000)
        }
    }
    update()
}

const stop=()=>{
    is_counting.value = !is_counting.value
    if(timer){
        clearInterval(timer)
        timer = null
        rate.value = 0
    }
    
}
</script>


<style scoped>
.task_group {
    margin-bottom: 10px;
}

.task_field {
    /* background-color: #e1f3fe; */
}

.circle {
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    padding: 10px;
}

.image {
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    padding: 10px;
}
</style>

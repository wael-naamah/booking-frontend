import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { fetchCategories, fetchTimeSlots, addAppointment } from "../../redux/actions";
import { selectCategories, selectCategoriesLoading, selectTimeslots, selectTimeslotsLoading } from "../../redux/selectors";
import { Appointment, Category, Contact, Salutation, Service } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Content } from "antd/es/layout/layout";
import { Row, Col, Card, Collapse, Steps, Calendar, Button, Spin, Form, Input, Select, Checkbox, message } from "antd";

import ServiceLogo from '../../assets/services/service.png'
import dayjs, { Dayjs } from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { SelectInfo } from "antd/es/calendar/generateCalendar";

const { Panel } = Collapse;
const { Option } = Select;

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    weekStart: 1
})

interface ICategoryState {
    selectedCategory: string | null;
    selectedService: Service | null;
    selectedSlot: { slot: string, calendar_id: string } | null;
    currentDate: Dayjs | null;
    current: number;
}

interface ICategoryProps {
    categories: Category[];
    loading: boolean;
    timeslots: {
        start: string;
        end: string;
        calendar_id: string;
    }[];
    timeslotsLoading: boolean;
    fetchCategories: () => Promise<any>;
    fetchTimeSlots: (date: string, categoryId: string, serviceId: string) => Promise<any>;
    onSubmit: (appointment: Appointment) => Promise<any>;
}

class CategoryPage extends React.Component<ICategoryProps, ICategoryState> {
    constructor(props: ICategoryProps) {
        super(props);
        this.state = {
            selectedCategory: null,
            selectedService: null,
            selectedSlot: null,
            currentDate: null,
            current: 0
        };
    }

    formRef = React.createRef<any>();

    onFinish = (values: any) => {
        const { selectedCategory, selectedService, selectedSlot, currentDate } = this.state;
        const [startTime, endTime] = (selectedSlot?.slot || "").split(" - ");
        const startDateTimeString = `${currentDate!.toISOString().slice(0, 10)}T${startTime}:00.000Z`;
        const endDateTimeString = `${currentDate!.toISOString().slice(0, 10)}T${endTime}:00.000Z`;

        const startDate = new Date(startDateTimeString);
        const endDate = new Date(endDateTimeString);

        const contact: Contact = {
            salutation: values.salutation,
            first_name: values.first_name,
            last_name: values.last_name,
            address: values.address,
            zip_code: values.zip_code,
            location: values.location,
            telephone: values.telephone,
            email: values.email,
        };

        const appointment: Appointment = {
            category_id: selectedCategory!,
            service_id: selectedService?._id!,
            calendar_id: selectedSlot?.calendar_id!,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            contact: contact,
            brand_of_device: values.brand_of_device,
            model: values.model,
            exhaust_gas_measurement: Boolean(values.exhaust_gas_measurement),
            has_maintenance_agreement: Boolean(values.has_maintenance_agreement),
            has_bgas_before: Boolean(values.has_bgas_before),
            year: values.year,
            attachments: values.attachments || undefined,
            remarks: values.remarks || undefined,
        }


        this.props.onSubmit(appointment)
            .then(data => {
                if (data && data._id) {
                    message.success('Successfully booked the appointment');
                    this.setState({
                        selectedCategory: null,
                        selectedService: null,
                        selectedSlot: null,
                        currentDate:
                            dayjs().day() === 0
                                ? dayjs().add(1, "day").startOf("day")
                                : dayjs().day() === 6
                                    ? dayjs().add(2, "day").startOf("day")
                                    : dayjs(),
                        current: 0
                    });
                } else {
                    message.error('Sorry! something went wrong while booking the appointment')
                }
            })
            .catch(() => {
                message.error('Sorry! something went wrong while booking the appointment')
            });
    };

    componentDidMount() {
        this.props.fetchCategories();
    }

    onChange = (value: number) => {
        if (value === 0) {
            this.setState({ current: value, selectedService: null, selectedCategory: null, currentDate: null });
        } else if (this.state.selectedService && value === 1) {
            this.setState({
                current: value, selectedSlot: null,
                currentDate: dayjs().day() === 0
                    ? dayjs().add(1, "day").startOf("day")
                    : dayjs().day() === 6
                        ? dayjs().add(2, "day").startOf("day")
                        : dayjs(),
            });
        }
    };



    fetchData = async () => {
        const { currentDate, selectedCategory, selectedService } = this.state;
        try {
            if (currentDate && selectedCategory && selectedService?._id)
                this.props.fetchTimeSlots(currentDate.toISOString(), selectedCategory, selectedService?._id)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    onSelectDate = (value: Dayjs, selectInfo: SelectInfo) => {
        if (selectInfo.source === 'date') {
            this.setState({ currentDate: value })
        }
    };

    formatTime = (time: string) => {
        const date = new Date(time);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    disabledDate = (current: Dayjs) => {
        // Disable previous days and weekends (Saturday and Sunday)
        return current && (current.isBefore(dayjs(), 'day') || current.day() === 0 || current.day() === 6);
    };

    componentDidUpdate(prevProps: ICategoryProps, prevState: ICategoryState) {
        const { currentDate, selectedCategory, selectedService } = this.state;

        if (prevState.currentDate !== currentDate
            || prevState.selectedCategory !== selectedCategory
            || prevState.selectedService !== selectedService) {
            this.fetchData();
        }
    }

    render() {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2003 }, (_, index) => currentYear - index).map(String);

        const { categories, loading, timeslots, timeslotsLoading } = this.props;
        const { selectedService, selectedSlot, current, currentDate } = this.state;

        const formattedSlots: { slot: string, calendar_id: string }[] = timeslots.reduce((result: { slot: string, calendar_id: string }[], slot) => {
            const formattedStart = this.formatTime(slot.start);
            const formattedEnd = this.formatTime(slot.end);
            const formattedSlot = `${formattedStart} - ${formattedEnd}`;
            const slots: string[] = []

            // Add to result if not already present
            if (!slots.includes(formattedSlot)) {
                slots.push(formattedSlot);
                result.push({ slot: formattedSlot, calendar_id: slot.calendar_id })
            }

            return result;
        }, []);

        if (loading) {
            return <div>loading...</div>;
        }

        return (
            <Content>
                <Row gutter={16}>
                    <Col xs={24} sm={18}>
                        {current === 0 ? <Collapse defaultActiveKey={["0"]}>
                            {categories.map((el, index) => (
                                <Panel header={<span className="font-bold text-lg">{el.name}</span>} key={`${index}`}>
                                    <Row gutter={[16, 16]}>
                                        {el.services.map((service) => (
                                            <Col key={service._id} xs={24} sm={16} md={12} lg={8} xl={6}>
                                                <Card
                                                    title={service.name}
                                                    onClick={() => {
                                                        this.setState({
                                                            selectedCategory: el._id!,
                                                            selectedService: service,
                                                            current: 1,
                                                            currentDate:
                                                                dayjs().day() === 0
                                                                    ? dayjs().add(1, "day").startOf("day")
                                                                    : dayjs().day() === 6
                                                                        ? dayjs().add(2, "day").startOf("day")
                                                                        : dayjs(),
                                                        });
                                                    }}
                                                    className="border border-gray-400 hover:border-primary transition duration-300 transform hover:scale-105"
                                                >
                                                    <img src={ServiceLogo} alt={service.name} className="mb-3" width={200} height={165} />
                                                    <p className="text-gray-600">Duration: {service.duration} mins</p>
                                                    <p className="text-lg text-primary font-bold">{service.price} EUR</p>
                                                    <p className="text-sm">{service.description}</p>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </Panel>
                            ))}
                        </Collapse> : current === 1 ?
                            <Row gutter={16} justify={'space-around'}>
                                <Col span={16}>
                                    <Card className="border border-gray-300 w-full h-96 rounded-md">
                                        <Calendar
                                            fullscreen={false}
                                            value={currentDate ? currentDate : dayjs()}
                                            onSelect={this.onSelectDate}
                                            disabledDate={this.disabledDate}
                                        />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Spin spinning={timeslotsLoading}>
                                        <Card title={currentDate ? dayjs(currentDate).format('dddd DD-MM-YYYY') : ""} className="border border-gray-300 w-full h-96 rounded-md overflow-y-auto">
                                            {formattedSlots.map((el) => (
                                                <div onClick={() => {
                                                    this.setState({ selectedSlot: el, current: 2 })
                                                }} className="p-4 m-3 flex items-center justify-center border border-gray-300 rounded-md bg-gray-100">
                                                    <span>{el.slot}</span>
                                                </div>
                                            ))}
                                        </Card>
                                    </Spin>
                                </Col>
                            </Row>
                            :
                            <Card className="border border-gray-300" >
                                <Form
                                    ref={this.formRef}
                                    name="contactForm"
                                    layout="vertical"
                                    onFinish={this.onFinish}
                                >
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Form.Item label="Salutation" name="salutation" rules={[{ required: true }]}>
                                                <Select>
                                                    {Object.values(Salutation).map((salutation) => (
                                                        <Option key={salutation} value={salutation}>
                                                            {salutation}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item label="First Name" name="first_name" rules={[{ required: true }]}>
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item label="Last Name" name="last_name" rules={[{ required: true }]}>
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Form.Item label="Street/No./Stairs/Door" name="address" rules={[{ required: true }]}>
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item label="ZIP CODE" name="zip_code" rules={[{ required: true }]}>
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item label="Location" name="location" rules={[{ required: true }]}>
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Form.Item label="Telephone" name="telephone" rules={[{ required: true }]}>
                                                <Input type="tel" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item label="Brand of Device" name="brand_of_device">
                                                <Select>
                                                    {['Baxi', 'Buderus', 'De Dietrich', 'To give', 'Junkers', 'Praiseworthy', 'Nordgas', 'Orange', 'Rapido', 'Saunier Duval', 'Vaillant', 'Viessmann', 'Wolf', 'Other'].map((salutation) => (
                                                        <Option key={salutation} value={salutation}>
                                                            {salutation}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Model/Type (e.g VCW AT 174/4-5. HG 15 WK19)" name="model">
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Year"
                                                name="year"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Please select a year',
                                                    },
                                                ]}
                                            >
                                                <Select placeholder="Select a year">
                                                    {['Last year', `I don't know anymore`].concat(years).map((year) => (
                                                        <Option key={year} value={year}>
                                                            {year}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <Form.Item label="Notes" name="remarks">
                                                <Input.TextArea />
                                            </Form.Item>
                                        </Col>
                                    </Row>


                                    <Form.Item label="Do you have a maintenance agreement with us?" name="has_maintenance_agreement" rules={[{ required: true }]}>
                                        <Select>
                                            {[{ lable: 'No', value: false }, { lable: 'Yes, the prices according to the maintenance agreement apply', value: true }].map((el) => (
                                                <Option key={el.lable} value={el.value}>
                                                    {el.lable}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item name="exhaust_gas_measurement" valuePropName="checked">
                                        <Checkbox>Exhaust Gas Measurement with test result (+ €40)</Checkbox>
                                    </Form.Item>
                                    <Form.Item name="has_bgas_before" valuePropName="checked">
                                        <Checkbox>Yes, B-GAS has been with me before</Checkbox>
                                    </Form.Item>


                                    <Row gutter={16} justify={'start'}>
                                        <Col span={8}>
                                            <Form.Item>
                                                <Button type="primary" htmlType="submit">
                                                    Submit
                                                </Button>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card>

                        }
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card className="border border-gray-300 h-96">
                            <Steps
                                current={current}
                                onChange={this.onChange}
                                direction="vertical"
                                className="h-350"
                                items={[
                                    {
                                        title: selectedService ? selectedService.name : 'Select Service',
                                        description: selectedService ? selectedService.description : '',
                                    },
                                    {
                                        title: 'Choose an Appointment',
                                        description: !selectedService ? "please select service to continue" : !selectedSlot?.slot ? "Please select the appointment time" : selectedSlot.slot,
                                    },
                                    {
                                        title: 'Enter Data',
                                        description: !selectedSlot ? "please select appointment to continue" : "please enter your data",
                                    },
                                ]}
                            />
                            <Button className="w-full mt-5" type="primary">BOOK A MEETING</Button>
                        </Card>
                    </Col>
                </Row>
            </Content>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    categories: selectCategories(state),
    loading: selectCategoriesLoading(state),
    timeslots: selectTimeslots(state),
    timeslotsLoading: selectTimeslotsLoading(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    fetchCategories: () => dispatch(fetchCategories()),
    fetchTimeSlots: (date: string, categoryId: string, serviceId: string) => dispatch(fetchTimeSlots(date, categoryId, serviceId)),
    onSubmit: (appointment: Appointment): Promise<any> =>
        dispatch(addAppointment(appointment))
});

export default connect(mapStateToProps, mapDispatchToProps)(CategoryPage);

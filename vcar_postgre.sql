--
-- PostgreSQL database dump
--

-- Dumped from database version 12.1
-- Dumped by pg_dump version 12.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: vantai; Type: SCHEMA; Schema: -; Owner: dmr
--

CREATE SCHEMA vantai;



--
-- Name: logs_type; Type: TYPE; Schema: vantai; Owner: dmr
--

CREATE TYPE vantai.logs_type AS ENUM (
    'app',
    'media',
    'message'
);



SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: drivers; Type: TABLE; Schema: vantai; Owner: dmr
--

CREATE TABLE vantai.drivers (
    id bigint NOT NULL,
    username character varying(255),
    email character varying(255),
    phone character varying(255),
    password character varying(255),
    fullname character varying(255),
    avatar character varying(255),
    type bigint DEFAULT '0'::bigint,
    numbercar bigint,
    typecarid bigint,
    latitude double precision,
    longitude double precision,
    createdat timestamp with time zone,
    updatedat timestamp with time zone NOT NULL
);



--
-- Name: drivers_id_seq; Type: SEQUENCE; Schema: vantai; Owner: dmr
--

CREATE SEQUENCE vantai.drivers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: drivers_id_seq; Type: SEQUENCE OWNED BY; Schema: vantai; Owner: dmr
--

ALTER SEQUENCE vantai.drivers_id_seq OWNED BY vantai.drivers.id;


--
-- Name: logs; Type: TABLE; Schema: vantai; Owner: dmr
--

CREATE TABLE vantai.logs (
    id bigint NOT NULL,
    itemid character varying(255),
    userid character varying(255),
    content character varying(255),
    type vantai.logs_type,
    status bigint,
    createdat timestamp with time zone NOT NULL,
    updatedat timestamp with time zone NOT NULL
);



--
-- Name: logs_id_seq; Type: SEQUENCE; Schema: vantai; Owner: dmr
--

CREATE SEQUENCE vantai.logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: logs_id_seq; Type: SEQUENCE OWNED BY; Schema: vantai; Owner: dmr
--

ALTER SEQUENCE vantai.logs_id_seq OWNED BY vantai.logs.id;


--
-- Name: notifications; Type: TABLE; Schema: vantai; Owner: dmr
--

CREATE TABLE vantai.notifications (
    id bigint NOT NULL,
    title character varying(255),
    content character varying(255),
    description character varying(255),
    image character varying(255),
    userid bigint,
    type bigint DEFAULT '0'::bigint,
    status bigint DEFAULT '0'::bigint,
    createdat timestamp with time zone,
    updatedat timestamp with time zone NOT NULL
);



--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: vantai; Owner: dmr
--

CREATE SEQUENCE vantai.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: vantai; Owner: dmr
--

ALTER SEQUENCE vantai.notifications_id_seq OWNED BY vantai.notifications.id;


--
-- Name: orderofdrives; Type: TABLE; Schema: vantai; Owner: dmr
--

CREATE TABLE vantai.orderofdrives (
    id bigint NOT NULL,
    driverid bigint,
    orderid bigint,
    status bigint DEFAULT '0'::bigint,
    createdat timestamp with time zone,
    endtime timestamp with time zone,
    updatedat timestamp with time zone NOT NULL
);



--
-- Name: orderofdrives_id_seq; Type: SEQUENCE; Schema: vantai; Owner: dmr
--

CREATE SEQUENCE vantai.orderofdrives_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: orderofdrives_id_seq; Type: SEQUENCE OWNED BY; Schema: vantai; Owner: dmr
--

ALTER SEQUENCE vantai.orderofdrives_id_seq OWNED BY vantai.orderofdrives.id;


--
-- Name: orders; Type: TABLE; Schema: vantai; Owner: dmr
--

CREATE TABLE vantai.orders (
    id bigint NOT NULL,
    fromlocation character varying(255),
    tolocation character varying(255),
    description character varying(255),
    price character varying(255),
    long bigint,
    fromlat double precision,
    fromlog double precision,
    tolat double precision,
    tolog double precision,
    type bigint DEFAULT '0'::bigint,
    status bigint DEFAULT '0'::bigint,
    createdat timestamp with time zone,
    updatedat timestamp with time zone NOT NULL
);




--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: vantai; Owner: dmr
--

CREATE SEQUENCE vantai.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: vantai; Owner: dmr
--

ALTER SEQUENCE vantai.orders_id_seq OWNED BY vantai.orders.id;


--
-- Name: pricetimeslots; Type: TABLE; Schema: vantai; Owner: dmr
--

CREATE TABLE vantai.pricetimeslots (
    id bigint NOT NULL,
    starttime character varying(255),
    endtime character varying(255),
    priceonekm bigint,
    createdat timestamp with time zone NOT NULL,
    updatedat timestamp with time zone NOT NULL
);



--
-- Name: pricetimeslots_id_seq; Type: SEQUENCE; Schema: vantai; Owner: dmr
--

CREATE SEQUENCE vantai.pricetimeslots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: pricetimeslots_id_seq; Type: SEQUENCE OWNED BY; Schema: vantai; Owner: dmr
--

ALTER SEQUENCE vantai.pricetimeslots_id_seq OWNED BY vantai.pricetimeslots.id;


--
-- Name: typecars; Type: TABLE; Schema: vantai; Owner: dmr
--

CREATE TABLE vantai.typecars (
    id bigint NOT NULL,
    name character varying(255),
    description character varying(255),
    weight bigint,
    createdat timestamp with time zone,
    updatedat timestamp with time zone NOT NULL
);



--
-- Name: typecars_id_seq; Type: SEQUENCE; Schema: vantai; Owner: dmr
--

CREATE SEQUENCE vantai.typecars_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: typecars_id_seq; Type: SEQUENCE OWNED BY; Schema: vantai; Owner: dmr
--

ALTER SEQUENCE vantai.typecars_id_seq OWNED BY vantai.typecars.id;


--
-- Name: users; Type: TABLE; Schema: vantai; Owner: dmr
--

CREATE TABLE vantai.users (
    id bigint NOT NULL,
    username character varying(255),
    email character varying(255),
    phone character varying(255),
    password character varying(255),
    fullname character varying(255),
    avatar character varying(255),
    type bigint DEFAULT '0'::bigint,
    status bigint DEFAULT '1'::bigint,
    numnoti bigint DEFAULT '0'::bigint,
    createdat timestamp with time zone,
    updatedat timestamp with time zone NOT NULL
);



--
-- Name: users_id_seq; Type: SEQUENCE; Schema: vantai; Owner: dmr
--

CREATE SEQUENCE vantai.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: vantai; Owner: dmr
--

ALTER SEQUENCE vantai.users_id_seq OWNED BY vantai.users.id;


--
-- Name: drivers id; Type: DEFAULT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.drivers ALTER COLUMN id SET DEFAULT nextval('vantai.drivers_id_seq'::regclass);


--
-- Name: logs id; Type: DEFAULT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.logs ALTER COLUMN id SET DEFAULT nextval('vantai.logs_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.notifications ALTER COLUMN id SET DEFAULT nextval('vantai.notifications_id_seq'::regclass);


--
-- Name: orderofdrives id; Type: DEFAULT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.orderofdrives ALTER COLUMN id SET DEFAULT nextval('vantai.orderofdrives_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.orders ALTER COLUMN id SET DEFAULT nextval('vantai.orders_id_seq'::regclass);


--
-- Name: pricetimeslots id; Type: DEFAULT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.pricetimeslots ALTER COLUMN id SET DEFAULT nextval('vantai.pricetimeslots_id_seq'::regclass);


--
-- Name: typecars id; Type: DEFAULT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.typecars ALTER COLUMN id SET DEFAULT nextval('vantai.typecars_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.users ALTER COLUMN id SET DEFAULT nextval('vantai.users_id_seq'::regclass);


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: vantai; Owner: dmr
--

COPY vantai.drivers (id, username, email, phone, password, fullname, avatar, type, numbercar, typecarid, latitude, longitude, createdat, updatedat) FROM stdin;
\.


--
-- Data for Name: logs; Type: TABLE DATA; Schema: vantai; Owner: dmr
--

COPY vantai.logs (id, itemid, userid, content, type, status, createdat, updatedat) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: vantai; Owner: dmr
--

COPY vantai.notifications (id, title, content, description, image, userid, type, status, createdat, updatedat) FROM stdin;
\.


--
-- Data for Name: orderofdrives; Type: TABLE DATA; Schema: vantai; Owner: dmr
--

COPY vantai.orderofdrives (id, driverid, orderid, status, createdat, endtime, updatedat) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: vantai; Owner: dmr
--

COPY vantai.orders (id, fromlocation, tolocation, description, price, long, fromlat, fromlog, tolat, tolog, type, status, createdat, updatedat) FROM stdin;
\.


--
-- Data for Name: pricetimeslots; Type: TABLE DATA; Schema: vantai; Owner: dmr
--

COPY vantai.pricetimeslots (id, starttime, endtime, priceonekm, createdat, updatedat) FROM stdin;
\.


--
-- Data for Name: typecars; Type: TABLE DATA; Schema: vantai; Owner: dmr
--

COPY vantai.typecars (id, name, description, weight, createdat, updatedat) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: vantai; Owner: dmr
--

COPY vantai.users (id, username, email, phone, password, fullname, avatar, type, status, numnoti, createdat, updatedat) FROM stdin;
1	\N	abc@123.com	012355651123	67032cb36e0aba43dd2006c6b68fe085	MrAbc	/abc.jpg	0	1	0	2018-08-03 08:27:35+07	2018-08-03 09:42:02+07
\.


--
-- Name: drivers_id_seq; Type: SEQUENCE SET; Schema: vantai; Owner: dmr
--

SELECT pg_catalog.setval('vantai.drivers_id_seq', 1, true);


--
-- Name: logs_id_seq; Type: SEQUENCE SET; Schema: vantai; Owner: dmr
--

SELECT pg_catalog.setval('vantai.logs_id_seq', 1, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: vantai; Owner: dmr
--

SELECT pg_catalog.setval('vantai.notifications_id_seq', 1, true);


--
-- Name: orderofdrives_id_seq; Type: SEQUENCE SET; Schema: vantai; Owner: dmr
--

SELECT pg_catalog.setval('vantai.orderofdrives_id_seq', 1, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: vantai; Owner: dmr
--

SELECT pg_catalog.setval('vantai.orders_id_seq', 1, true);


--
-- Name: pricetimeslots_id_seq; Type: SEQUENCE SET; Schema: vantai; Owner: dmr
--

SELECT pg_catalog.setval('vantai.pricetimeslots_id_seq', 1, true);


--
-- Name: typecars_id_seq; Type: SEQUENCE SET; Schema: vantai; Owner: dmr
--

SELECT pg_catalog.setval('vantai.typecars_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: vantai; Owner: dmr
--

SELECT pg_catalog.setval('vantai.users_id_seq', 1, true);


--
-- Name: drivers idx_16505_primary; Type: CONSTRAINT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.drivers
    ADD CONSTRAINT idx_16505_primary PRIMARY KEY (id);


--
-- Name: logs idx_16515_primary; Type: CONSTRAINT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.logs
    ADD CONSTRAINT idx_16515_primary PRIMARY KEY (id);


--
-- Name: notifications idx_16524_primary; Type: CONSTRAINT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.notifications
    ADD CONSTRAINT idx_16524_primary PRIMARY KEY (id);


--
-- Name: orderofdrives idx_16535_primary; Type: CONSTRAINT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.orderofdrives
    ADD CONSTRAINT idx_16535_primary PRIMARY KEY (id);


--
-- Name: orders idx_16542_primary; Type: CONSTRAINT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.orders
    ADD CONSTRAINT idx_16542_primary PRIMARY KEY (id);


--
-- Name: pricetimeslots idx_16553_primary; Type: CONSTRAINT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.pricetimeslots
    ADD CONSTRAINT idx_16553_primary PRIMARY KEY (id);


--
-- Name: typecars idx_16562_primary; Type: CONSTRAINT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.typecars
    ADD CONSTRAINT idx_16562_primary PRIMARY KEY (id);


--
-- Name: users idx_16571_primary; Type: CONSTRAINT; Schema: vantai; Owner: dmr
--

ALTER TABLE ONLY vantai.users
    ADD CONSTRAINT idx_16571_primary PRIMARY KEY (id);


--
-- Name: idx_16535_driverid; Type: INDEX; Schema: vantai; Owner: dmr
--

CREATE UNIQUE INDEX idx_16535_driverid ON vantai.orderofdrives USING btree (driverid);


--
-- Name: idx_16535_orderid; Type: INDEX; Schema: vantai; Owner: dmr
--

CREATE UNIQUE INDEX idx_16535_orderid ON vantai.orderofdrives USING btree (orderid);


--
-- PostgreSQL database dump complete
--

